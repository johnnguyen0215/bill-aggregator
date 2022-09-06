const isDateInRange = (dateStr) => {
  const today = new Date();

  const lastMonth = new Date();
  lastMonth.setDate(1);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const date = new Date(dateStr);

  return date <= today && date >= lastMonth;
};

const queryBuilder = (email, subject) => `from:${email} AND subject:${subject}`;

export const getMessageBody = async (billInfo, failureCallback) => {
  let response = null;

  try {
    response = await window.gapi.client.gmail.users.messages.list({
      userId: 'me',
      maxResults: 10,
      q: queryBuilder(billInfo.email, billInfo.subject),
    });
  } catch (err) {
    failureCallback();
    return;
  }

  if (response) {
    const responseObject = JSON.parse(response.body);

    const messageId = responseObject.messages[0].id;
    const messageResponse = await window.gapi.client.gmail.users.messages.get({
      userId: 'me',
      id: messageId,
    });

    const messageResponseBody = JSON.parse(messageResponse.body);

    const dateHeader = messageResponseBody.payload.headers.find(
      (header) => header.name === 'Date'
    );

    const date = dateHeader.value;

    if (isDateInRange(date)) {
      const htmlPart = messageResponseBody?.payload?.parts.find(
        (part) => part.mimeType === 'text/html'
      );

      const partData = htmlPart.body.data;

      const partBody = atob(partData.replace(/-/g, '+').replace(/_/g, '/'));

      console.log('PartBody: ', partBody);

      return partBody;
    }
  }
};
