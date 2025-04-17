/**
 * Builds a Gmail search query for finding bill-related emails
 * @param {string} email - Sender's email address
 * @param {string} subject - Email subject to search for
 * @param {string} body - Optional body text to search for
 * @param {Object} dateRange - Date range to search within
 * @param {number} dateRange.month - Selected month (0-11)
 * @param {number} dateRange.year - Selected year
 * @returns {string} Gmail search query string
 */
const buildGmailSearchQuery = (
  email,
  subject,
  body,
  { month: selectedMonth, year: selectedYear }
) => {
  if (!email || !subject) {
    throw new Error('Email and subject are required parameters');
  }

  // Calculate the date range for the search
  const afterMonth = selectedMonth + 1;
  const afterYear = selectedYear;
  
  // Handle December -> January transition
  const beforeMonth = selectedMonth + 2 > 12 ? 1 : selectedMonth + 2;
  const beforeYear = selectedMonth + 2 > 12 ? selectedYear + 1 : selectedYear;

  const beforeDate = `${beforeMonth}/15/${beforeYear}`;
  const afterDate = `${afterMonth}/15/${afterYear}`;

  // Build the search query
  const baseQuery = `from:${email} AND subject:${subject} AND before:${beforeDate} AND after:${afterDate}`;
  return body ? `${baseQuery} AND "${body}"` : baseQuery;
};

/**
 * Extracts the HTML content from a Gmail message
 * @param {Object} messageResponse - Gmail API message response
 * @returns {string} Decoded HTML content
 */
const extractMessageContent = (messageResponse) => {
  if (!messageResponse?.payload) {
    return '';
  }

  let htmlPart = null;
  if (messageResponse.payload.parts) {
    htmlPart = messageResponse.payload.parts.find(
      (part) => part.mimeType === 'text/html'
    );
  } else {
    htmlPart = messageResponse.payload;
  }

  if (!htmlPart?.body?.data) {
    return '';
  }

  // Decode base64 content
  return window.atob(htmlPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
};

/**
 * Retrieves a specific bill message from Gmail
 * @param {Object} billInfo - Bill information
 * @param {string} billInfo.email - Sender's email
 * @param {string} billInfo.subject - Email subject
 * @param {string} billInfo.body - Optional body text
 * @param {string} billInfo.id - Bill identifier
 * @param {Function} failureCallback - Callback for error handling
 * @param {Object} selectedMonthYear - Selected date range
 * @returns {Promise<Object>} Message details including date and content
 */
export const getMessage = async (billInfo, failureCallback, selectedMonthYear) => {
  if (!billInfo?.email || !billInfo?.subject) {
    throw new Error('Invalid bill information provided');
  }

  try {
    // Search for messages
    const searchResponse = await window.gapi.client.gmail.users.messages.list({
      userId: 'me',
      maxResults: 10,
      q: buildGmailSearchQuery(
        billInfo.email,
        billInfo.subject,
        billInfo.body,
        selectedMonthYear
      ),
    });

    if (!searchResponse?.result?.messages?.length) {
      return {
        id: billInfo.id,
        date: '',
        body: '',
      };
    }

    // Get the first matching message
    const messageId = searchResponse.result.messages[0].id;
    const messageResponse = await window.gapi.client.gmail.users.messages.get({
      userId: 'me',
      id: messageId,
    });

    const messageData = JSON.parse(messageResponse.body);
    const dateHeader = messageData?.payload?.headers?.find(
      (header) => header.name === 'Date'
    );

    return {
      id: billInfo.id,
      date: dateHeader?.value || '',
      body: extractMessageContent(messageData),
    };
  } catch (error) {
    console.error('Error retrieving message:', error);
    if (failureCallback) {
      failureCallback(error);
    }
    return {
      id: billInfo.id,
      date: '',
      body: '',
    };
  }
};

/**
 * Extracts the first dollar amount found in a string
 * @param {string} emailBody - Text content to search
 * @returns {string|null} The first dollar amount found, or null if none found
 */
export const getDollarAmount = (emailBody) => {
  if (!emailBody) {
    return null;
  }
  
  const matches = emailBody.match(/\$[0-9]+(\.[0-9]+)?/g);
  return matches?.[0]?.slice(1) || null;
};
