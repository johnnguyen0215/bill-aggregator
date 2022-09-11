import { Fab, Drawer, TextField, Typography } from '@mui/material';
import { Save } from '@mui/icons-material';
import styles from './styles.module.css';
import { green } from '@mui/material/colors';
import { useEffect, useState } from 'react';
import { snakeCase } from 'snake-case';

export const DetailsDrawer = ({
  isOpen,
  handleClose,
  handleSave,
  billDetailFields,
}) => {
  const [name, setName] = useState(billDetailFields.name);
  const [email, setEmail] = useState(billDetailFields.email);
  const [subject, setSubject] = useState(billDetailFields.subject);
  const [amount, setAmount] = useState(billDetailFields.amount);

  const handleFieldChange = (fieldName, value) => {
    switch (fieldName) {
      case 'name':
        setName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'subject':
        setSubject(value);
        break;
      case 'amount':
        setAmount(value);
        break;
      default:
    }
  };

  const handleSaveClick = () => {
    const billDetails = {
      name,
      email,
      subject,
      amount,
      id: snakeCase(name),
      type: email ? 'email' : 'manual',
    };

    handleSave(billDetails);
  };

  useEffect(() => {
    if (billDetailFields) {
      setName(billDetailFields.name);
      setEmail(billDetailFields.email);
      setSubject(billDetailFields.subject);
      setAmount(billDetailFields.amount);
    }
  }, [billDetailFields]);

  return (
    <Drawer anchor="right" open={isOpen} onClose={handleClose}>
      <div class={styles.formContainer}>
        <Typography variant="h4" gutterBottom align="center">
          Bill Details
        </Typography>
        <div class={styles.textFieldContainer}>
          <TextField
            required
            label="Name"
            value={name}
            onChange={(event) => handleFieldChange('name', event.target.value)}
          />
        </div>
        <div class={styles.textFieldContainer} value={email}>
          <TextField
            type="email"
            label="Email"
            value={email}
            onChange={(event) => handleFieldChange('email', event.target.value)}
          />
        </div>
        <div class={`${styles.textFieldContainer}`} value={subject}>
          <TextField
            label="Subject"
            fullWidth={500}
            value={subject}
            onChange={(event) =>
              handleFieldChange('subject', event.target.value)
            }
          />
        </div>
        <div class={styles.textFieldContainer} value={amount}>
          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={(event) =>
              handleFieldChange('amount', event.target.value)
            }
          />
        </div>
      </div>
      <div class={styles.saveContainer}>
        <Fab
          sx={{
            color: '#FFF',
            bgcolor: green[300],
            bottom: 16,
            right: 16,
            position: 'absolute',
            '&:hover': {
              bgcolor: green[400],
            },
          }}
          onClick={handleSaveClick}
        >
          <Save />
        </Fab>
      </div>
    </Drawer>
  );
};
