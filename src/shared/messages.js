const queryBuilder = (
  email,
  subject,
  { month: selectedMonth, year: selectedYear }
) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const beforeDate = `${currentMonth + 1}/15/${currentYear}`;
  const afterDate = `${selectedMonth + 1}/15/${selectedYear}`;

  console.log('BeforeDate: ', beforeDate);
  console.log('AfterDate: ', afterDate);

  return `from:${email} AND subject:${subject} AND before:${beforeDate} AND after:${afterDate}`;
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
      q: queryBuilder(billInfo.email, billInfo.subject, selectedMonthYear),
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
