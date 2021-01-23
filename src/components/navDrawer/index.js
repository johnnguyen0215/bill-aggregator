import './style.css';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { useTheme } from '@material-ui/core/styles';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import DrawerContext from '../../contexts/drawerContext';
import BillsContext from '../../contexts/billsContext';
import useStyles from '../../customHooks/useStyles';

function NavDrawer(props) {
  const { window } = props;
  const classes = useStyles();
  const theme = useTheme();
  const drawerContext = useContext(DrawerContext);
  const billsContext = useContext(BillsContext);

  const { billsInfo } = billsContext;

  const handleDrawerToggle = () => {
    drawerContext.setDrawerOpen(!drawerContext.drawerOpen);
  };

  const drawer = (
    <div>
      <div className={classes.toolbar} />
      <List>
        {[
          {
            name: 'Aggregator Page',
            id: 'aggregator_page',
            path: '/',
          },
          {
            name: 'Bill Input Page',
            id: 'bill_manager',
            path: '/bill_manager',
          },
        ].map((listItem) => (
          <Link
            className="drawerLink"
            to={listItem.path}
            key={`listitem-${listItem.id}`}
          >
            <ListItem button key={listItem.id}>
              <ListItemText primary={listItem.name} />
            </ListItem>
          </Link>
        ))}
      </List>
      <Divider />
      <List>
        {Object.values(billsInfo)
          .filter((billInfo) => billInfo.type === 'email')
          .map((billInfo) => (
            <Link
              className="drawerLink"
              to={`/${billInfo.id}`}
              key={`bill-link-${billInfo.id}`}
            >
              <ListItem button key={billInfo.id}>
                <ListItemText primary={billInfo.name} />
              </ListItem>
            </Link>
          ))}
      </List>
    </div>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <>
      <nav className={classes.drawer} aria-label="mailbox folders">
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Hidden smUp implementation="css">
          <Drawer
            container={container}
            variant="temporary"
            anchor={theme.direction === 'rtl' ? 'right' : 'left'}
            open={drawerContext.drawerOpen}
            onClose={handleDrawerToggle}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
        <Hidden xsDown implementation="css">
          <Drawer
            classes={{
              paper: classes.drawerPaper,
            }}
            variant="permanent"
            open
          >
            {drawer}
          </Drawer>
        </Hidden>
      </nav>
    </>
  );
}

export default NavDrawer;
