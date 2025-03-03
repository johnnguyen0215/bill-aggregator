const queryBuilder = (
  email,
  subject,
  body,
  { month: selectedMonth, year: selectedYear }
) => {
  let beforeMonth;
  let beforeYear;
  const afterMonth = selectedMonth + 1;
  const afterYear = selectedYear;

  // If selected month is december, we want to compare against January of next year.
  if (selectedMonth + 2 > 12) {
    beforeMonth = 1;
    beforeYear = selectedYear + 1;
  } else {
    beforeMonth = selectedMonth + 2;
    beforeYear = selectedYear;
  }

  const beforeDate = `${beforeMonth}/15/${beforeYear}`;
  const afterDate = `${afterMonth}/15/${afterYear}`;

  const bodySearch = body ? ` AND "${body}"` : '';

  return `from:${email} AND subject:${subject} AND before:${beforeDate} AND after:${afterDate}${bodySearch}`;
};

export const getMessage = async (
  billInfo,
  failureCallback,
  selectedMonthYear
) => {
  let response = null;

  try {
    response = await window.gapi.client.gmail.users.messages.list({
      userId: 'me',
      maxResults: 10,
      q: queryBuilder(
        billInfo.email,
        billInfo.subject,
        billInfo.body,
        selectedMonthYear
      ),
    });
  } catch (err) {
    failureCallback();
  }

  let date = '';
  let body = '';

  if (response?.result?.messages) {
    const messageId = response?.result?.messages[0].id;
    const messageResponse = await window.gapi.client.gmail.users.messages.get({
      userId: 'me',
      id: messageId,
    });

    const messageResponseBody = JSON.parse(messageResponse.body);

    const dateHeader = messageResponseBody?.payload?.headers?.find(
      (header) => header.name === 'Date'
    );

    date = dateHeader.value;

    let htmlPart = null;

    if (messageResponseBody?.payload?.parts) {
      htmlPart = messageResponseBody?.payload?.parts?.find(
        (part) => part.mimeType === 'text/html'
      );
    } else {
      htmlPart = messageResponseBody?.payload;
    }

    const partData = htmlPart?.body?.data;

    const partBody = window.atob(
      partData.replace(/-/g, '+').replace(/_/g, '/')
    );

    body = partBody;
  }

  return {
    id: billInfo.id,
    date,
    body,
  };
};

export const getDollarAmount = (emailBody) => {
  const matches = emailBody.match(/\$[0-9]+(\.[0-9]+)?/g);
  return matches?.[0]?.slice(1);
};
