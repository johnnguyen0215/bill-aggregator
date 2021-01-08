import { useEffect, useState } from "react";

function BillPage(props) {
  const {billInfo} = props;

  const {message, setMessage} = useState('');
  const {amount, setAmount} = useState(null);

  useEffect(() => {

  });

  return (
    <div className="billPage">
      <div className="totalHeader">Total: {amount}</div>
      {
        message ?
          (
            <div
              className="billHtml"
              dangerouslySetInnerHTML={{
                __html: message
              }}
            />
          ) :
          <div>No Bill could be found for payment period.</div>
      }
    </div>
  )
}

export default BillPage;