import React, { Component, Fragment } from 'react'
import { Avatar, Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import SwipeableViews from 'react-swipeable-views';
import StarIcon from '@material-ui/icons/Star';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { SensorIcon } from './index'
import QRCode from 'qrcode-react'
import { Scrollbars } from 'react-custom-scrollbars';
import strings from '../strings'

const isFirefox = typeof InstallTrigger !== 'undefined';

const styles = theme => ({
  container: {
    display: "flex",
    alignItems: 'center',
    justifyContent: 'center',
    width: "100%",
  },
  qr_container: {
    width: 330,
    height: 330,
    marginTop: 40,
    backgroundColor: "#3F51B5"
  },
});

function TabContainer({ children, dir }) {
  return(<Typography component="div" dir={dir}>{children}</Typography>);
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
  dir: PropTypes.string.isRequired,
};

class LoginContainer extends Component {
  state = {
    sync_key: this.props.sync_key,
    favourites: this.props.favourites,
    own_sensors: this.props.own_sensors,
    clicked: undefined,
    anchorEl: null,
    page: 0,
  };

  handlePageChange = (event, value) => {
    this.setState({ page: value });
  }

  handleMenuClick = (event, id) => {
    event.stopPropagation();
    event.preventDefault();
    this.setState({ clicked: id, anchorEl: event.currentTarget });
  }

  handleMenuClose = (item_id, sensor) => {
    if (item_id === 0) {
      this.setState({ clicked: undefined, anchorEl: null });
    } else if (item_id === 1) {
      this.props.onShowSensorData(sensor);
      this.setState({ clicked: undefined, anchorEl: null });
    } else if (item_id === 2) {
      this.props.onEditSensor(sensor);
      this.setState({ clicked: undefined, anchorEl: null });
    } else if (item_id === 3) {
      this.props.onRemoveSensor(sensor.chip_id);
      this.setState({ clicked: undefined, anchorEl: null });
    } else if (item_id === 4) {
      this.props.onSensorDetails(sensor);
      this.setState({ clicked: undefined, anchorEl: null });
    }
  };

  render() {
    const { classes, theme } = this.props;

    return (
      <div style={{height: "100%"}}>
        {this.props.logged_in === false &&
          <Scrollbars>
            <div className={classes.container}>
              <Avatar className={classes.qr_container}>
                <div style={{backgroundColor: "#FFF", padding: 10, borderRadius: 10}}>
                  <QRCode value={this.state.sync_key} size={210} logo={"https://map.h2801469.stratoserver.net/qr_icon.png"} logoWidth={70}/>
                </div>
              </Avatar>
              <Typography variant="h6" style={isFirefox ? {position: "absolute", marginTop: 450, color: "#3F51B5"} : {position: "absolute", marginTop: 230, color: "#3F51B5"}} gutterBottom><b>{strings.link_with_android_app}</b></Typography>
              <Typography variant="subtitle1" style={isFirefox ? {position: "absolute", marginTop: 560, color: "#666", textAlign: "center"} : {position: "absolute", marginTop: 290, color: "#666", textAlign: "center"}} gutterBottom>{strings.link_instruction_1}<br/>{strings.link_instruction_2}</Typography>
              <Typography variant="subtitle1" style={isFirefox ? {position: "absolute", marginTop: 690, color: "#666", textAlign: "center"} : {position: "absolute", marginTop: 360, color: "#666", textAlign: "center"}} gutterBottom><i style={{color: "#3F51B5"}}>{strings.link_instruction_3}</i></Typography>
              <Typography variant="subtitle1" style={isFirefox ? {position: "absolute", marginTop: 800, color: "#666", textAlign: "center", marginBottom: 30} : {position: "absolute", marginTop: 415, color: "#666", textAlign: "center", marginBottom: 30}} gutterBottom>{strings.link_instruction_4}</Typography>
            </div>
          </Scrollbars>
        }
        {this.props.logged_in &&
          <div style={{height: "calc(100% - 8px)"}}>
            <Scrollbars style={{height: "calc(100% - 64px)"}}>
              <SwipeableViews axis='x' index={this.state.page} onChangeIndex={this.handlePageChange} animateHeight>
                <TabContainer style={{overflow: 'auto'}} dir={theme.direction}>
                  {this.props.favourites.length > 0 &&
                    <List style={{overflow: 'auto'}}>
                      {this.props.favourites.map(sensor => {
                        return (
                          <Fragment>
                            <ListItem button onClick={() => this.props.onShowSensorData(sensor)}>
                              <Avatar style={{ backgroundColor: sensor.color }}><SensorIcon/></Avatar>
                              <ListItemText primary={sensor.name} secondary={sensor.chip_id} />
                              <IconButton aria-label="Weitere Optionen" onClick={(event) => this.handleMenuClick(event, sensor.chip_id)} style={{zIndex: "3"}} aria-haspopup="true"><MoreVertIcon /></IconButton>
                            </ListItem>
                            {this.state.clicked !== undefined &&
                              <Menu anchorEl={this.state.anchorEl} open={this.state.clicked === sensor.chip_id} onClose={() => this.handleMenuClose(0, sensor)} >
                                <MenuItem onClick={() => this.handleMenuClose(1, sensor)}>{strings.show_measurements}</MenuItem>
                                <MenuItem onClick={() => this.handleMenuClose(2, sensor)}>{strings.edit_sensor}</MenuItem>
                                <MenuItem onClick={() => this.handleMenuClose(3, sensor)}>{strings.remove_sensor}</MenuItem>
                                <MenuItem onClick={() => this.handleMenuClose(4, sensor)}>{strings.properties}</MenuItem>
                              </Menu>
                            }
                          </Fragment>
                        );
                      }, this)}
                    </List>
                  }
                  {this.props.favourites.length === 0 &&
                    <Fragment>
                      <Avatar src="/images/star_impossible.png" style={{width: 250, height: 250, marginLeft: 60, marginTop: 50, padding: 15}} />
                      <Typography variant="subtitle1" style={{marginLeft: 20, marginRight: 20, marginTop: 40, color: "#666", textAlign: "center"}} gutterBottom><b>{strings.no_favourites}</b></Typography>
                    </Fragment>
                  }
                </TabContainer>
                <TabContainer style={{overflow: 'auto'}} dir={theme.direction}>
                  {this.props.own_sensors.length > 0 &&
                    <List style={{overflow: 'auto'}}>
                      {this.props.own_sensors.map(sensor => {
                        return (
                          <Fragment>
                            <ListItem button onClick={() => this.props.onShowSensorData(sensor)}>
                              <Avatar style={{ backgroundColor: sensor.color }}><SensorIcon/></Avatar>
                              <ListItemText primary={sensor.name} secondary={sensor.chip_id} />
                              <IconButton aria-label="Weitere Optionen" onClick={(event) => this.handleMenuClick(event, sensor.chip_id)} style={{zIndex: "3"}} aria-haspopup="true"><MoreVertIcon /></IconButton>
                            </ListItem>
                            {this.state.clicked !== undefined &&
                              <Menu anchorEl={this.state.anchorEl} open={this.state.clicked === sensor.chip_id} onClose={() => this.handleMenuClose(0, sensor)} >
                                <MenuItem onClick={() => this.handleMenuClose(1, sensor)}>{strings.show_measurements}</MenuItem>
                                <MenuItem onClick={() => this.handleMenuClose(2, sensor)}>{strings.edit_sensor}</MenuItem>
                                <MenuItem onClick={() => this.handleMenuClose(3, sensor)}>{strings.remove_sensor}</MenuItem>
                                <MenuItem onClick={() => this.handleMenuClose(4, sensor)}>{strings.properties}</MenuItem>
                              </Menu>
                            }
                          </Fragment>
                        );
                      }, this)}
                    </List>
                  }
                  {this.props.own_sensors.length === 0 &&
                    <Fragment>
                      <Avatar src="/images/sensor_large.png" style={{width: 200, height: 200, marginLeft: 85, marginTop: 75, padding: 15}} />
                      <Typography variant="subtitle1" style={{marginLeft: 20, marginRight: 20, marginTop: 65, color: "#666", textAlign: "center"}} gutterBottom><b>{strings.no_own_sensors}</b></Typography>
                    </Fragment>
                  }
                </TabContainer>
              </SwipeableViews>
            </Scrollbars>
            <Tabs value={this.state.page} onChange={this.handlePageChange} variant="fullWidth" indicatorColor="primary" textColor="primary">
              <Tab icon={<StarIcon />} label={strings.favourites} />
              <Tab icon={<SensorIcon />} label={strings.own_sensors} />
            </Tabs>
          </div>
        }
      </div>
    );
  }
}

LoginContainer.propTypes = {
  theme: PropTypes.object.isRequired,
  logged_in: PropTypes.bool.isRequired,
  sync_key: PropTypes.string.isRequired,
  favourites: PropTypes.array.isRequired,
  own_sensors: PropTypes.array.isRequired,
  onShowSensorData: PropTypes.func.isRequired,
  onEditSensor: PropTypes.func.isRequired,
  onRemoveSensor: PropTypes.func.isRequired,
  onSensorDetails: PropTypes.func.isRequired,
};

export default withStyles(styles, { withTheme: true })(LoginContainer);
