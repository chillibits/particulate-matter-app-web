import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import * as Keys from '../keys';
import { withStyles } from '@material-ui/core/styles'
import request from 'superagent'
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import Tooltip from '@material-ui/core/Tooltip';
import { CirclePicker } from 'react-color'
import { LocationPickerDialog } from './index'
import green from '@material-ui/core/colors/green';
import fire from '../fire'
import strings from '../strings'
import * as Constants from '../constants'
import Geocode from "react-geocode"

const styles = theme => ({
  buttonProgress: {
    position: 'absolute',
    color: green[500],
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
});

class DialogAddSensor extends React.Component {
  state = {
    active_step: 1,
    chip_id: "",
    next_disabled: true,
    loading: false,
    chip_id_error: false,
    error_desc: "",
    sensor_name: "",
    color: "",
    lat: "",
    lng: "",
    alt: "",
    location_picker_open: false,
  };

  handleNext = (step) => {
    if(step === 1) {
      this.setState({ loading: true });
      //Existiert eine ID bereits
      let currentComponent = this;
      request.post(Constants.BACKEND_URL)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({command: "issensordataexisting", chip_id: this.state.chip_id})
        .end(function(err, res) {
          var result = res.text.trim();
          if(result === "true") {
            currentComponent.setState({ loading: false, active_step: 2, next_disabled: true });
          } else {
            currentComponent.setState({ loading: false, chip_id_error: true, next_disabled: true, error_desc: strings.error_add_sensor });
          }
        });
    } else if(step === 3) {
      this.addSensor();
    } else {
      this.setState({ active_step: this.state.active_step +1, next_disabled: true });
    }
  };

  handleBack = () => {
    this.setState({ active_step: this.state.active_step -1 });
  };

  chipIDChange = (event) => {
    var next_disabled = event.target.value.length === 0;
    this.setState({ chip_id: event.target.value, chip_id_error: false, error_desc: "", next_disabled: next_disabled });
  }

  nameChange = (event) => {
    var next_disabled = event.target.value.length === 0 || this.state.color === "";
    this.setState({ sensor_name: event.target.value, next_disabled: next_disabled });
  }

  colorChange = (color, event) => {
    var next_disabled = this.state.sensor_name.length === 0;
    this.setState({ color: color.hex, next_disabled: next_disabled });
  }

  chooseLocation = () => {
    this.setState({ location_picker_open: true });
  }

  locationChange = (position, address) => {
    console.log(address);
    console.log(position);
    this.setState({ location_picker_open: false });
  }

  latChanged = (event) => {
    var next_disabled = event.target.value.length === 0 || this.state.lng.length === 0 || this.state.alt.length === 0;
    if(event.target.value.length > 0 && this.state.lng.length > 0) this.checkPlace();
    this.setState({ lat: event.target.value, next_disabled: next_disabled });
  }

  lngChanged = (event) => {
    var next_disabled = this.state.lat.length === 0 || event.target.value.length === 0 || this.state.alt.length === 0;
    if(event.target.value.length > 0 && this.state.lat.length > 0) this.checkPlace();
    this.setState({ lng: event.target.value, next_disabled: next_disabled });
  }

  altChanged = (event) => {
    var next_disabled = this.state.lat.length === 0 || this.state.lng.length === 0 || event.target.value.length === 0;
    if(this.state.lat.length > 0 && this.state.lng.length > 0) this.checkPlace();
    this.setState({ alt: event.target.value, next_disabled: next_disabled });
  }

  addSensor = () => {
    this.setState({ loading: true });

    if(this.props.logged_in) {
      //Beim Nutzer hinzufügen
      var timestamp = Math.floor(Date.now());
      var data_new = this.props.user_data;
      data_new.push({ chip_id: this.state.chip_id, color: this.state.color, fav: false, name: this.state.sensor_name });
      var obj = { time: timestamp, device: "web", data: data_new }
      fire.database().ref('sync/' + this.props.sync_key).set(obj);
    }

    //Auf dem Server hinzufügen
    let currentComponent = this;
    request.post(Constants.BACKEND_URL)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({command: "addsensor", chip_id: this.state.chip_id, lat: this.state.lat, lng: this.state.lng, alt: this.state.alt})
      .end(function(err, res) {
        var result = res.text.trim();
        if(result === 0) result = 2;
        currentComponent.props.onClose(parseInt(result));
      });
  }

  addSensorPrivate = () => {
    this.setState({ loading: true });

    //Beim Nutzer hinzufügen
    var timestamp = Math.floor(Date.now());
    var data_new = this.props.user_data;
    data_new.push({ chip_id: this.state.chip_id, color: this.state.color, fav: false, name: this.state.sensor_name });
    var obj = { time: timestamp, device: "web", data: data_new }
    fire.database().ref('sync/' + this.props.sync_key).set(obj)
    this.props.onClose(1);
  }

  checkPlace = () => {
    let currentComponent = this;
    Geocode.setApiKey(Keys.GOOGLE_GEOCODE_KEY);
    Geocode.fromLatLng(this.state.lat, this.state.lng).then(
      response => {
        this.setState({ selectedAddress: response.results[0].formatted_address });
      },
      error => {
        console.error(error);
      }
    );
  }

  onEnterPressed = (ev) => {
    if (ev.key === 'Enter') {
      if(!this.state.next_disabled) this.handleNext(this.state.active_step);
      ev.preventDefault();
    }
  }

  render() {
    const {classes} = this.props;

    return (
      <Fragment>
        <Dialog open={this.props.opened} fullWidth onClose={this.props.onClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" >
          <DialogTitle id="alert-dialog-title">{strings.add_sensor}</DialogTitle>
          <DialogContent>
            <Stepper activeStep={this.state.active_step -1} orientation="vertical">
              {/* Step 1 */}
              <Step key={strings.enter_chip_id}>
                <StepLabel>{strings.enter_chip_id}</StepLabel>
                <StepContent>
                  {/* Content */}
                  <div>
                    <Typography>{strings.enter_chip_id_instruction_1} <a href='https://chillibits.com/pmapp/en/faq/#6' target='blank'>{strings.faq_site}</a> {strings.enter_chip_id_instruction_2}</Typography>
                    <TextField value={this.state.chip_id} label={strings.chip_id} type="number" error={this.state.chip_id_error} onChange={this.chipIDChange} variant="outlined" onKeyPress={this.onEnterPressed} style={{ marginTop: 15 }} />
                    {this.state.error_desc !== "" && <Typography color="error" style={{marginTop: 15}}>{this.state.error_desc}</Typography>}
                  </div>
                  {/* Buttons */}
                  <Button disabled={true} onClick={this.handleBack} style={{marginTop: 15, marginRight: 15}}>{strings.back}</Button>
                  <span style={{position: "relative", width: 80}}>
                    <Button variant="contained" color="primary" disabled={this.state.loading || this.state.next_disabled} style={{marginTop: 15}} onClick={() => this.handleNext(1)}>{strings.next}</Button>
                    {this.state.loading && <CircularProgress size={24} style={{marginTop: 0}} className={classes.buttonProgress} />}
                  </span>
                </StepContent>
              </Step>
              {/* Step 2 */}
              <Step key={strings.enter_base_data}>
                <StepLabel>{strings.enter_base_data}</StepLabel>
                <StepContent>
                  {/* Content */}
                  <div>
                    <Typography>{strings.display_name_color_instruction}</Typography>
                    <TextField label={strings.display_name} value={this.state.sensor_name} style={{width: 360, marginTop: 15, marginBottom: 15}} onChange={this.nameChange} onKeyPress={this.onEnterPressed} variant="outlined"/>
                    <CirclePicker color={this.state.color} width="380px" onChangeComplete={this.colorChange} />
                  </div>
                  {/* Buttons */}
                  <Button onClick={this.handleBack} style={{marginTop: 15, marginRight: 15}}>{strings.back}</Button>
                  <span style={{position: "relative", width: 80}}>
                    <Button variant="contained" color="primary" disabled={this.state.next_disabled} style={{marginTop: 15}} onClick={() => this.handleNext(2)}>{strings.next}</Button>
                  </span>
                </StepContent>
              </Step>
              {/* Step 3 */}
              <Step key={strings.add_sensor_to_map}>
                <StepLabel>{strings.add_sensor_to_map}</StepLabel>
                <StepContent>
                  {/* Content */}
                  <div>
                    <Typography>{strings.add_sensor_to_map_instruction_1} <a href='mailto:contact@chillibits.com'>{strings.contact}</a> {strings.add_sensor_to_map_instruction_2}</Typography>
                    <Tooltip title={strings.soon_available}>
                      <Button variant="outlined" color="primary" _onClick={this.chooseLocation} style={{marginTop: 10, width: "100%"}}>{strings.choose_location}</Button>
                    </Tooltip>
                    <TextField label={strings.longitude} style={{marginTop: 10, marginRight: "2%", width: "49%"}} type="number" onChange={this.lngChanged} onKeyPress={this.onEnterPressed} inputProps={{ min: -180, max: 180, maxLength: 9 }}variant="outlined" />
                    <TextField label={strings.latitude} style={{marginTop: 10, width: "49%"}} type="number" onChange={this.latChanged} onKeyPress={this.onEnterPressed} inputProps={{ min: -90, max: 90, maxLength: 8 }} variant="outlined" />
                    <TextField label={strings.mounting_height} style={{marginTop: 10, width: "49%"}} type="number" onChange={this.altChanged} onKeyPress={this.onEnterPressed} inputProps={{ min: 0, max: 999, maxLength: 3 }} variant="outlined" />
                    {this.state.selectedAddress !== undefined && <div>
                      <Typography style={{ marginTop: 5, marginBottom: 5 }}><b>{this.state.selectedAddress}</b></Typography>
                      <Typography>{strings.is_this_the_right_place}</Typography>
                    </div>}
                  </div>
                  {/* Buttons */}
                  <Button onClick={this.handleBack} style={{marginTop: 15, marginRight: 15}}>{strings.back}</Button>
                  {this.props.logged_in && <Button variant="outlined" onClick={this.addSensorPrivate} style={{marginTop: 15, marginRight: 15}}>{strings.skip}</Button>}
                  <span style={{position: "relative", width: 80}}>
                    <Button variant="contained" color="primary" disabled={this.state.loading || this.state.next_disabled} style={{marginTop: 15}} onClick={() => this.handleNext(3)}>{strings.add_sensor}</Button>
                    {this.state.loading && <CircularProgress size={24} style={{marginTop: 0}} className={classes.buttonProgress} />}
                  </span>
                </StepContent>
              </Step>
            </Stepper>
          </DialogContent>
        </Dialog>
        {this.state.location_picker_open && <LocationPickerDialog onChoose={this.locationChange}/>}
      </Fragment>
    );
  }
}

DialogAddSensor.propTypes = {
  sync_key: PropTypes.string.isRequired,
  user_data: PropTypes.array.isRequired,
  opened: PropTypes.bool.isRequired,
  logged_in: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSensorAdded: PropTypes.func.isRequired,
};

export default withStyles(styles)(DialogAddSensor);;
