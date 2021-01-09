import { useEffect, useState } from "react";
import { getMessageBody } from '../../shared/messages';

function BillPage(props) {
  console.log('Bill Page');
  const {billInfo, gapi} = props;

  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState(null);

  useEffect(() => {
    const fetchMessage = async () => {
      const messageBody = await getMessageBody(gapi, billInfo);

      if (messageBody) {
        setMessage(messageBody);

        const billAmount = parseFloat(messageBody.match(/\$\s*\d*.\d{2}/)[0].slice(1));

        setAmount(billAmount);
      } else {
        setMessage('No Bill Found');
        setAmount(null);
      }
    }

    fetchMessage();
  }, [billInfo, gapi, setMessage, setAmount]);

  return (
    <div className="billPage">
      {
        amount !== null && <div className="totalHeader">Total: {amount}</div>
      }
      <div
        className="billHtml"
        dangerouslySetInnerHTML={{
          __html: message
        }}
      />
    </div>
  )
}

export default BillPage;