import { Paper, Fab, TextField, Button } from '@material-ui/core';
import BackspaceIcon from '@material-ui/icons/Backspace';
import EditIcon from '@material-ui/icons/Edit';
import { useState } from 'react';
import './style.css';
import classnames from 'classnames';

function BillCard({ billInfo }) {
  const [showFields, setShowFields] = useState(false);

  const cardClasses = classnames({
    billCard: true,
    '-expanded': showFields,
  });

  return (
    <li className="billItem" key={billInfo.id}>
      <Paper className={cardClasses} square>
        <div>
          <span className="billInfoName">{billInfo.name}</span>
          <Fab
            className="editButton"
            size="small"
            color="primary"
            onClick={() => {
              setShowFields(!showFields);
            }}
          >
            <EditIcon fontSize="small" />
          </Fab>
          <Fab className="removeButton" size="small" color="secondary">
            <BackspaceIcon fontSize="small" />
          </Fab>
        </div>
        <div className="fieldContainer">
          <div className="billCardField">
            <span>Bill Name:</span>
            <TextField type="text" />
          </div>
          <div className="billCardField">
            <span>Bill Email:</span>
            <TextField type="text" />
          </div>
          <div className="billCardField">
            <span>Bill Subject:</span>
            <TextField type="text" />
          </div>
          <Button
            className="saveButton"
            color="primary"
            variant="contained"
            onClick={() => {}}
          >
            Save
          </Button>
        </div>
      </Paper>
    </li>
  );
}

export default BillCard;
