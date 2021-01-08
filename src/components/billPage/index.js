function BillPage(props) {
  const {amount, message} = props;

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