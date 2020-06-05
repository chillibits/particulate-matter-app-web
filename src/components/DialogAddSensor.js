import React, {Fragment} from "react";
import PropTypes from "prop-types";
import * as Keys from "../keys";
import { withStyles } from "@material-ui/core/styles";
import request from "superagent";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import StepContent from "@material-ui/core/StepContent";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import CircularProgress from "@material-ui/core/CircularProgress";
import Tooltip from "@material-ui/core/Tooltip";
import { CirclePicker } from "react-color";
import { LocationPickerDialog } from "./index";
import green from "@material-ui/core/colors/green";
import fire from "../fire";
import strings from "../strings";
import * as Constants from "../constants";
import Geocode from "react-geocode";

const styles = (theme) => ({
  buttonProgress: {
    position: "absolute",
    color: green[500],
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
});

class DialogAddSensor extends React.Component {
  state = {
    activeStep: 1,
    chipId: "",
    nextDisabled: true,
    loading: false,
    chipIdError: false,
    errorDesc: "",
    sensorName: "",
    color: "",
    lat: "",
    lng: "",
    alt: "",
    locationPickerOpen: false,
  };

  handleNext = (step) => {
    if(step === 1) {
      this.setState({ loading: true });
      //Existiert eine ID bereits
      let currentComponent = this;
      request.post(Constants.BACKEND_URL)
        .set("Content-Type", "application/x-www-form-urlencoded")
        .send({ command: "issensordataexisting", chip_id: this.state.chipId })
        .end(function(err, res) {
          var result = res.text.trim();
          if(result === "true") {
            currentComponent.setState({ loading: false, activeStep: 2, nextDisabled: true });
          } else {
            currentComponent.setState({ loading: false, chipIdError: true, nextDisabled: true, errorDesc: strings.errorAddSensor });
          }
        });
    } else if(step === 3) {
      this.addSensor();
    } else {
      this.setState({ activeStep: this.state.activeStep +1, nextDisabled: true });
    }
  };

  handleBack = () => {
    this.setState({ activeStep: this.state.activeStep -1 });
  };

  chipIdChange = (event) => {
    var nextDisabled = event.target.value.length === 0;
    this.setState({ chipId: event.target.value, chipIdError: false, errorDesc: "", nextDisabled: nextDisabled });
  }

  nameChange = (event) => {
    var nextDisabled = event.target.value.length === 0 || this.state.color === "";
    this.setState({ sensorName: event.target.value, nextDisabled: nextDisabled });
  }

  colorChange = (color, event) => {
    var nextDisabled = this.state.sensorName.length === 0;
    this.setState({ color: color.hex, nextDisabled: nextDisabled });
  }

  chooseLocation = () => {
    this.setState({ locationPickerOpen: true });
  }

  locationChange = (position, address) => {
    this.setState({ locationPickerOpen: false });
  }

  latChanged = (event) => {
    var nextDisabled = event.target.value.length === 0 || this.state.lng.length === 0 || this.state.alt.length === 0;
    this.setState({ lat: event.target.value, nextDisabled: nextDisabled });
    if(this.state.lat.length > 0 && this.state.lat.length > 0) this.checkPlace();
  }

  lngChanged = (event) => {
    var nextDisabled = this.state.lat.length === 0 || event.target.value.length === 0 || this.state.alt.length === 0;
    this.setState({ lng: event.target.value, nextDisabled: nextDisabled });
  }

  altChanged = (event) => {
    var nextDisabled = this.state.lat.length === 0 || this.state.lng.length === 0 || event.target.value.length === 0;
    this.setState({ alt: event.target.value, nextDisabled: nextDisabled });
  }

  addSensor = () => {
    this.setState({ loading: true });

    if(this.props.signedIn) {
      //Beim Nutzer hinzufügen
      var timestamp = Math.floor(Date.now());
      var dataNew = this.props.userData;
      dataNew.push({ chipId: this.state.chipId, color: this.state.color, fav: false, name: this.state.sensorName });
      var obj = { time: timestamp, device: "web", data: dataNew }
      fire.database().ref("sync/" + this.props.syncKey).set(obj);
    }

    //Auf dem Server hinzufügen
    let currentComponent = this;
    request.post(Constants.BACKEND_URL)
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send({ command: "addsensor", chip_id: this.state.chipId, lat: this.state.lat, lng: this.state.lng, alt: this.state.alt })
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
    var dataNew = this.props.userData;
    dataNew.push({ chipId: this.state.chipId, color: this.state.color, fav: false, name: this.state.sensorName });
    var obj = { time: timestamp, device: "web", data: dataNew };
    fire.database().ref("sync/" + this.props.syncKey).set(obj);
    this.props.onClose(1);
  }

  checkPlace = () => {
    if(this.state.lat.length > 0 && this.state.lng.length > 0) {
      Geocode.setApiKey(Keys.GOOGLE_GEOCODE_KEY);
      Geocode.fromLatLng(this.state.lat, this.state.lng).then(
        (response) => {
          this.setState({ selectedAddress: response.results[0].formatted_address });
        }
      );
    } else {
      this.setState({ selectedAddress: strings.pleaseEnterValidCoordinates });
    }
  }

  onEnterPressed = (ev) => {
    if (ev.key === "Enter") {
      if(!this.state.nextDisabled) this.handleNext(this.state.activeStep);
      ev.preventDefault();
    }
  }

  render() {
    const {classes} = this.props;

    return (
      <Fragment>
        <Dialog open={this.props.opened} fullWidth onClose={this.props.onClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" >
          <DialogTitle id="alert-dialog-title">{strings.addSensor}</DialogTitle>
          <DialogContent>
            <Stepper activeStep={this.state.activeStep -1} orientation="vertical">
              {/* Step 1 */}
              <Step key={strings.enterChipId}>
                <StepLabel>{strings.enterChipId}</StepLabel>
                <StepContent>
                  {/* Content */}
                  <div>
                    <Typography>{strings.enterChipIdInstruction1} <a href="https://chillibits.com/pmapp/en/faq#6" target="_blank" rel="noopener noreferrer">{strings.faqSite}</a> {strings.enterChipIdInstruction2}</Typography>
                    <TextField value={this.state.chipId} label={strings.chipId} type="number" error={this.state.chipIdError} onChange={this.chipIdChange} variant="outlined" onKeyPress={this.onEnterPressed} style={{ marginTop: 15 }} />
                    {this.state.errorDesc !== "" && <Typography color="error" style={{marginTop: 15}}>{this.state.errorDesc}</Typography>}
                  </div>
                  {/* Buttons */}
                  <Button disabled={true} onClick={this.handleBack} style={{marginTop: 15, marginRight: 15}}>{strings.back}</Button>
                  <span style={{position: "relative", width: 80}}>
                    <Button variant="contained" color="primary" disabled={this.state.loading || this.state.nextDisabled} style={{marginTop: 15}} onClick={() => this.handleNext(1)}>{strings.next}</Button>
                    {this.state.loading && <CircularProgress size={24} style={{marginTop: 0}} className={classes.buttonProgress} />}
                  </span>
                </StepContent>
              </Step>
              {/* Step 2 */}
              <Step key={strings.enterGeneralData}>
                <StepLabel>{strings.enterGeneralData}</StepLabel>
                <StepContent>
                  {/* Content */}
                  <div>
                    <Typography>{strings.displayNameColorInstruction}</Typography>
                    <TextField label={strings.displayName} value={this.state.sensorName} style={{width: 360, marginTop: 15, marginBottom: 15}} onChange={this.nameChange} onKeyPress={this.onEnterPressed} variant="outlined"/>
                    <CirclePicker color={this.state.color} width="380px" onChangeComplete={this.colorChange} />
                  </div>
                  {/* Buttons */}
                  <Button onClick={this.handleBack} style={{marginTop: 15, marginRight: 15}}>{strings.back}</Button>
                  <span style={{position: "relative", width: 80}}>
                    <Button variant="contained" color="primary" disabled={this.state.nextDisabled} style={{marginTop: 15}} onClick={() => this.handleNext(2)}>{strings.next}</Button>
                  </span>
                </StepContent>
              </Step>
              {/* Step 3 */}
              <Step key={strings.addSensorToMap}>
                <StepLabel>{strings.addSensorToMap}</StepLabel>
                <StepContent>
                  {/* Content */}
                  <div>
                    <Typography>{strings.addSensorToMapInstruction1} <a href="mailto:contact@chillibits.com">{strings.contact}</a> {strings.addSensorToMapInstruction2}</Typography>
                    <Tooltip title={strings.availableSoon}>
                      <Button variant="outlined" color="primary" _onClick={this.chooseLocation} style={{marginTop: 10, width: "100%"}}>{strings.chooseLocation}</Button>
                    </Tooltip>
                    <TextField label={strings.latitude} style={{marginTop: 10, marginRight: "2%", width: "49%"}} type="number" onChange={this.latChanged} onKeyPress={this.onEnterPressed} inputProps={{ min: -180, max: 180, maxLength: 9 }}variant="outlined" />
                    <TextField label={strings.longitude} style={{marginTop: 10, width: "49%"}} type="number" onChange={this.lngChanged} onKeyPress={this.onEnterPressed} inputProps={{ min: -90, max: 90, maxLength: 8 }} variant="outlined" />
                    <TextField label={strings.mountingHeight} style={{marginTop: 10, marginRight: "2%", width: "49%"}} type="number" onChange={this.altChanged} onKeyPress={this.onEnterPressed} inputProps={{ min: 0, max: 999, maxLength: 3 }} variant="outlined" />
                    <Button variant="outlined" color="primary" style={{marginTop: 10, width: "49%"}} onClick={this.checkPlace}>{strings.testLocation}</Button>
                    {this.state.selectedAddress !== null && <div>
                      <Typography style={{ marginTop: 5, marginBottom: 5 }}><b>{this.state.selectedAddress}</b></Typography>
                      <Typography>{strings.isThisTheRightPlace}</Typography>
                    </div>}
                  </div>
                  {/* Buttons */}
                  <Button onClick={this.handleBack} style={{marginTop: 15, marginRight: 15}}>{strings.back}</Button>
                  {this.props.signedIn && <Button variant="outlined" onClick={this.addSensorPrivate} style={{marginTop: 15, marginRight: 15}}>{strings.skip}</Button>}
                  <span style={{position: "relative", width: 80}}>
                    <Button variant="contained" color="primary" disabled={this.state.loading || this.state.nextDisabled} style={{marginTop: 15}} onClick={() => this.handleNext(3)}>{strings.addSensor}</Button>
                    {this.state.loading && <CircularProgress size={24} style={{marginTop: 0}} className={classes.buttonProgress} />}
                  </span>
                </StepContent>
              </Step>
            </Stepper>
          </DialogContent>
        </Dialog>
        {this.state.locationPickerOpen && <LocationPickerDialog onChoose={this.locationChange}/>}
      </Fragment>
    );
  }
}

DialogAddSensor.propTypes = {
  syncKey: PropTypes.string.isRequired,
  userData: PropTypes.array.isRequired,
  opened: PropTypes.bool.isRequired,
  signedIn: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSensorAdded: PropTypes.func.isRequired,
};

export default withStyles(styles)(DialogAddSensor);
