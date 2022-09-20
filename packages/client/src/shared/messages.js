const isDateInRange = (dateStr) => {
  const today = new Date();

  const lastMonth = new Date();
  lastMonth.setDate(1);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const date = new Date(dateStr);

  return date <= today && date >= lastMonth;
};

const queryBuilder = (email, subject, currentMonth) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  const beforeDate = `${currentMonth}/15/${currentYear}`;
  const afterDate = `${
    currentMonth === 1 ? 12 : currentMonth - 1
  }/15/${currentYear}`;

  return `from:${email} AND subject:${subject} AND before:${beforeDate} AND after:${afterDate}`;
};

export const getMessage = async (billInfo, failureCallback, currentMonth) => {
  let response = null;

  try {
    response = await window.gapi.client.gmail.users.messages.list({
      userId: 'me',
      maxResults: 10,
      q: queryBuilder(billInfo.email, billInfo.subject, currentMonth),
    });
  } catch (err) {
    failureCallback();
    return;
  }

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

    const date = dateHeader.value;

    let body = '';

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

    return {
      id: billInfo.id,
      date,
      body,
    };
  }

  return {
    id: billInfo.id,
    date: '',
    body: '',
  };
};

export const getDollarAmount = (emailBody) => {
  const matches = emailBody.match(/\$[0-9]+(\.[0-9]+)?/g);

  return matches?.[0]?.slice(1);
};
