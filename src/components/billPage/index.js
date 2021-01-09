import { useContext, useEffect, useState } from 'react';
import LoadingContext from '../../contexts/loadingContext';
import { getMessageBody } from '../../shared/messages';

function BillPage(props) {
  const { billInfo, gapi } = props;
  const loadingContext = useContext(LoadingContext);

  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState(null);

  useEffect(() => {
    const fetchMessage = async () => {
      loadingContext.setPending(true);

      const messageBody = await getMessageBody(gapi, billInfo);

      if (messageBody) {
        setMessage(messageBody);

        const billAmount = parseFloat(
          messageBody.match(/\$\s*\d*.\d{2}/)[0].slice(1)
        );

        setAmount(billAmount);
      } else {
        setMessage('No Bill Found');
        setAmount(null);
      }

      loadingContext.setPending(false);
    };

    fetchMessage();
  }, [billInfo, gapi, setMessage, setAmount, loadingContext]);

  return (
    <div className="billPage">
      {amount !== null && <h1 className="totalHeader">Total: ${amount}</h1>}
      <div
        className="billHtml"
        dangerouslySetInnerHTML={{
          __html: message,
        }}
      />
    </div>
  );
}

export default BillPage;
