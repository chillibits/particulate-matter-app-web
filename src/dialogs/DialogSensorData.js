import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import AppBar from "@material-ui/core/AppBar";
import LinearProgress from "@material-ui/core/LinearProgress";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import CloseIcon from "@material-ui/icons/Close";
import Slide from "@material-ui/core/Slide";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Tooltip from "@material-ui/core/Tooltip";
import SwipeableViews from "react-swipeable-views";
import { MuiPickersUtilsProvider, DatePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import deLocale from "date-fns/locale/de";
import { SensorDataTable, SensorIcon } from "../components/index";
import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";
import Edit from "@material-ui/icons/Edit";
import { Scrollbars } from "react-custom-scrollbars";
import moment from "moment";
import { ResponsiveLine } from "@nivo/line";
import Slider from "@material-ui/core/Slider";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Switch from "@material-ui/core/Switch";
import request from "superagent";
import strings from "../strings";
import * as Constants from "../constants";

let counter = 0;

function TabContainer({ children, dir }) {
  return ( <Typography component="div" dir={dir} style={{ padding: 8 * 3 }}> {children} </Typography> );
}

function createData(time, pm1, pm2, temp, humidity, pressure) {
  counter += 1;
  return { id: counter, time, pm1, pm2, temp, humidity, pressure };
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
  dir: PropTypes.string.isRequired,
};

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    width: 500,
  },
  appBar: {
    position: "relative",
  },
  flex: {
    flex: 1,
  },
  card: {
    minWidth: 275,
    margin: 15,
  },
  cardContent: {
    height: 50,
    padding: 5
  },
  dateSelection: {
    marginTop: 10,
  },
});

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

function round(x, n) {
    return Math.round(x * Math.pow(10, n)) / Math.pow(10, n);
}

class FullScreenDialog extends React.Component {
  state = {
    data: null,
    dataPM1: [],
    dataPM2: [],
    dataTemp: [],
    dataHumidity: [],
    dataPressure: [],
    dataEUThreshold1: [],
    dataEUThreshold2: [],
    dataWHOThreshold1: [],
    dataWHOThreshold2: [],
    dataGraph: [],
    loading: true,
    picker: null,
    open: false,
    value: 0,
    defaultDate:  new Date(),
    selectedDate: new Date(),
    dialogDetailsOpen: false,
    currentZoom: 10000,
    enabledPM1: true,
    enabledPM2: true,
    enabledTemp: false,
    enabledHumidity: false,
    enabledPressure: false,
    enabledEUThreshold: false,
    enabledWHOThreshold: false
  };

  constructor(props) {
    super(props);
    this.loadSensorData();
  }

  loadSensorData = () => {
    this.setState({
      loading: true
    });

    let currentComponent = this;
    counter = 0;

    var from = this.state.selectedDate;
    from.setHours(0,0,0,0);
    var to = new Date(from.getTime() + 86400000);

    request.post(Constants.BACKEND_DATA_URL)
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send({ id: this.props.sensor.chipId, from: from.getTime() / 1000, to: to.getTime() / 1000, minimize: true, with_gps: false, with_note: false })
      .end(function(err, res) {
        var result = res.text.trim();
        var obj = JSON.parse(result);

        var dataRecords = [];
        var dataRecordsGraph = [];
        var listPM1 = [];
        var listPM2 = [];
        var listTemp = [];
        var listHumidity = [];
        var listPressure = [];
        var listEU1 = [];
        var listEU2 = [];
        var listWHO1 = [];
        var listWHO2 = [];

        obj.map((item, key) => {
          var time = new Date(item.time * 1000);
          dataRecords.push(createData(moment(item.time * 1000).format("HH:mm:ss"), item.p1, item.p2, round(item.t, 1), round(item.h, 1), round(item.p / 100, 2)));
          var pm1Double = parseFloat(item.p1);
          var pm2Double = parseFloat(item.p2);
          var tempDouble = parseFloat(round(item.t, 1));
          var humidityDouble = parseFloat(round(item.h, 1));
          var pressureDouble = parseFloat(round(item.p / 100, 2));
          listPM1.push({ x: time, y: pm1Double });
          listPM2.push({ x: time, y: pm2Double });
          listTemp.push({ x: time, y: tempDouble });
          listHumidity.push({ x: time, y: humidityDouble });
          listPressure.push({ x: time, y: pressureDouble });
          listEU1.push({ x: time, y: 40 });
          listEU2.push({ x: time, y: 25 });
          listWHO1.push({ x: time, y: 15 });
          listWHO2.push({ x: time, y: 5 });
          return (item, key);
        });

        if(currentComponent.state.enabledPM1) dataRecordsGraph.push({ id: strings.pm1, color: "hsl(353, 70%, 50%)", data: listPM1 });
        if(currentComponent.state.enabledPM2) dataRecordsGraph.push({ id: strings.pm2, color: "hsl(87, 70%, 50%)", data: listPM2 });
        if(currentComponent.state.enabledTemp) dataRecordsGraph.push({ id: strings.temperature, color: "hsl(183, 70%, 50%)", data: listTemp });
        if(currentComponent.state.enabledHumidity) dataRecordsGraph.push({ id: strings.humidity, color: "hsl(281, 70%, 50%)", data: listHumidity });
        if(currentComponent.state.enabledPressure) dataRecordsGraph.push({ id: strings.pressure, color: "hsl(61, 70%, 50%)", data: listPressure });
        if(currentComponent.state.enabledEUThreshold) {
          dataRecordsGraph.push({ id: strings.euThreshold, color: "hsl(0, 100%, 50%)", data: listEU1 });
          dataRecordsGraph.push({ id: strings.euThreshold, color: "hsl(1, 100%, 50%)", data: listEU2 });
        }
        if(currentComponent.state.enabledWHOThreshold) {
          dataRecordsGraph.push({ id: strings.whoThreshold, color: "hsl(2, 100%, 50%)", data: listWHO1 });
          dataRecordsGraph.push({ id: strings.whoThreshold, color: "hsl(3, 100%, 50%)", data: listWHO2 });
        }

        currentComponent.setState({
          data: dataRecords,
          dataGraph: dataRecordsGraph,
          dataPM1: listPM1,
          dataPM2: listPM2,
          dataTemp: listTemp,
          dataHumidity: listHumidity,
          dataPressure: listPressure,
          dataEUThreshold1: listEU1,
          dataEUThreshold2: listEU2,
          dataWHOThreshold1: listWHO1,
          dataWHOThreshold2: listWHO2,
          loading: false
        });
      });
  }

  handleClickOpen = () => {
    this.setState({
      open: true
    });
  };

  handleClose = () => {
    this.setState({
      open: false
    });
  };

  showDetails = () => {
    this.props.onOpenDetails(this.props.sensor);
  }

  handleTabChange = (event, value) => {
    this.setState({
      value
    });
  };

  handleTabChangeIndex = (index) => {
    this.setState({
      value: index
    });
  };

  openPicker = () => {
    this.picker.open();
  };

  minusDay = () => {
    var date = this.state.selectedDate;
    this.setState({
      selectedDate: new Date(date.setTime(date.getTime() - 86400000 /* 1 Tag */))
    });
    this.loadSensorData();
  }

  plusDay = () => {
    var date = this.state.selectedDate;
    this.setState({
      selectedDate: new Date(date.setTime(date.getTime() + 86400000 /* 1 Tag */))
    });
    this.loadSensorData();
  }

  handleDateChange = (date) => {
    this.setState({
      selectedDate: date
    });
    this.loadSensorData();
  }

  onZoomChange = (event, value) => {
    this.setState({
      currentZoom: value
    });
  }

  onCheckedChange = (name) => (event) => {
    var data = [];
    if(name === "enabledPM1" && event.target.checked) {
      data.push({ id: strings.pm1, color: "hsl(353, 70%, 50%)", data: this.state.dataPM1 });
    } else if(name !== "enabledPM1" && this.state.enabledPM1) {
      data.push({ id: strings.pm1, color: "hsl(353, 70%, 50%)", data: this.state.dataPM1 });
    }
    if(name === "enabledPM2" && event.target.checked) {
      data.push({ id: strings.pm2, color: "hsl(87, 70%, 50%)", data: this.state.dataPM2 });
    } else if(name !== "enabledPM2" && this.state.enabledPM2) {
      data.push({ id: strings.pm2, color: "hsl(87, 70%, 50%)", data: this.state.dataPM2 });
    }
    if(name === "enabledTemp" && event.target.checked) {
      data.push({ id: strings.temperature, color: "hsl(183, 70%, 50%)", data: this.state.dataTemp });
    } else if(name !== "enabledTemp" && this.state.enabledTemp) {
      data.push({ id: strings.temperature, color: "hsl(183, 70%, 50%)", data: this.state.dataTemp });
    }
    if(name === "enabledHumidity" && event.target.checked) {
      data.push({ id: strings.humidity, color: "hsl(281, 70%, 50%)", data: this.state.dataHumidity });
    } else if(name !== "enabledHumidity" && this.state.enabledHumidity) {
      data.push({ id: strings.humidity, color: "hsl(281, 70%, 50%)", data: this.state.dataHumidity });
    }
    if(name === "enabledPressure" && event.target.checked) {
      data.push({ id: strings.pressure, color: "hsl(61, 70%, 50%)", data: this.state.dataPressure });
    } else if(name !== "enabledPressure" && this.state.enabledPressure) {
      data.push({ id: strings.pressure, color: "hsl(61, 70%, 50%)", data: this.state.dataPressure });
    }
    if(name === "enabledEUThreshold" && event.target.checked) {
      data.push({ id: strings.euThreshold + " - " + strings.pm1, color: "hsl(0, 100%, 50%)", data: this.state.dataEUThreshold1 });
      data.push({ id: strings.euThreshold + " - " + strings.pm2, color: "hsl(1, 100%, 50%)", data: this.state.dataEUThreshold2 });
    } else if(name !== "enabledEUThreshold" && this.state.enabledEUThreshold) {
      data.push({ id: strings.euThreshold + " - " + strings.pm1, color: "hsl(0, 100%, 50%)", data: this.state.dataEUThreshold1 });
      data.push({ id: strings.euThreshold + " - " + strings.pm2, color: "hsl(1, 100%, 50%)", data: this.state.dataEUThreshold2 });
    }
    if(name === "enabledWHOThreshold" && event.target.checked) {
      data.push({ id: strings.whoThreshold + " - " + strings.pm1, color: "hsl(2, 100%, 50%)", data: this.state.dataWHOThreshold1 });
      data.push({ id: strings.whoThreshold + " - " + strings.pm2, color: "hsl(3, 100%, 50%)", data: this.state.dataWHOThreshold2 });
    } else if(name !== "enabledWHOThreshold" && this.state.enabledWHOThreshold) {
      data.push({ id: strings.whoThreshold + " - " + strings.pm1, color: "hsl(2, 100%, 50%)", data: this.state.dataWHOThreshold1 });
      data.push({ id: strings.whoThreshold + " - " + strings.pm2, color: "hsl(3, 100%, 50%)", data: this.state.dataWHOThreshold2 });
    }
    this.setState({
      [name]: event.target.checked,
      dataGraph: data
    });
  }

  render() {
    const { classes, theme } = this.props;

    return (
      <Dialog fullScreen open={this.props.opened} onClose={this.props.onClose} TransitionComponent={Transition} >
        <AppBar className={classes.appBar}>
          <Toolbar>
            <Tooltip title={strings.showSensorDetails}>
              <IconButton color="inherit" onClick={this.showDetails} aria-label={strings.showDetails}><SensorIcon /></IconButton>
            </Tooltip>
            <Typography variant="h6" color="inherit" className={classes.flex}>{this.props.sensor.name} - ChipID: {this.props.sensor.chipId}</Typography>
            <Tooltip title={strings.closeWindow}>
              <IconButton color="inherit" onClick={this.props.onClose}><CloseIcon /></IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>
        {this.state.loading && <LinearProgress />}
        <Card className={classes.card}>
          <CardContent className={classes.cardContent}>
            <Tooltip title={strings.dayBefore}>
              <IconButton onClick={this.minusDay}><KeyboardArrowLeft /></IconButton>
            </Tooltip>
            <MuiPickersUtilsProvider utils={DateFnsUtils} locale={deLocale}>
              <DatePicker value={this.state.selectedDate} onChange={this.handleDateChange} className={classes.dateSelection} showTodayButton disableFuture cancelLabel="Abbrechen" todayLabel="Heute" okLabel="OK" invalidLabel="Ungültige Eingabe" format="dd.MM.yyyy" ref={node => { this.picker = node; }}/>
            </MuiPickersUtilsProvider>
            <Tooltip title={strings.chooseAnotherDate}>
              <IconButton onClick={this.openPicker}><Edit /></IconButton>
            </Tooltip>
            {this.state.selectedDate >= this.state.defaultDate && <Tooltip title={strings.dayAfter}><IconButton onClick={this.plusDay} disabled><KeyboardArrowRight disabled/></IconButton></Tooltip>}
            {this.state.selectedDate < this.state.defaultDate && <Tooltip title={strings.dayAfter}><IconButton onClick={this.plusDay}><KeyboardArrowRight /></IconButton></Tooltip>}
          </CardContent>
        </Card>
        <AppBar position="static" color="default">
          <Tabs value={this.state.value} onChange={this.handleTabChange} indicatorColor="primary" textColor="primary" variant="fullWidth">
            <Tab label={strings.diagram} />
            <Tab label={strings.dataRecords} />
          </Tabs>
        </AppBar>
        <Scrollbars>
          <SwipeableViews axis={theme.direction === "rtl" ? "x-reverse" : "x"} index={this.state.value} onChangeIndex={this.handleTabChangeIndex} style={{overflowX: "hidden"}} animateHeight>
            <TabContainer dir={theme.direction} style={{overflowX: "hidden"}}>
              <Scrollbars style={{height: 600, overflowX: "hidden"}}>
                {this.state.dataGraph !== [] && <div style={{height: 590, width: this.state.currentZoom}}><ResponsiveLine
                  data={this.state.dataGraph}
                  margin={{ top: 10, right: 50, bottom: 40, left: 30 }}
                  xScale={{
                      type: "time",
                      format: "native",
                      precision: "minute"
                  }}
                  yScale={{
                      type: "linear",
                      stacked: false,
                      min: "auto",
                      max: "auto"
                  }}
                  curve={this.state.smoothCurve ? (this.state.basisCurve ? "basis" : "cardinal") : "linear"}
                  axisBottom={{
                      orient: "bottom",
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: strings.timeOfDay,
                      legendOffset: 35,
                      format: "%H:%m",
                      legendPosition: "middle"
                  }}
                  axisLeft={{
                      orient: "left",
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: strings.measurement,
                      legendOffset: -40,
                      legendPosition: "middle"
                  }}
                  colors={{ scheme: "category10" }}
                  lineWidth={1}
                  pointSize={this.state.disableDots ? 0 : 5}
                  pointBorderWidth={2}
                  pointBorderColor={{ from: 'serieColor' }}
                  enablePointLabel={true}
                  pointLabel={
                    this.state.enableTime ? ((e) => {
                      return "".concat(moment(e.x).format("HH:mm"),"");
                    }) : ""
                  }
                  enableSlices={'x'}
                  animate={true}
                  legends={[{
                          anchor: "bottom-right",
                          direction: "row",
                          justify: false,
                          translateX: 25,
                          translateY: 40,
                          itemsSpacing: 10,
                          itemDirection: "left-to-right",
                          itemWidth: 100,
                          itemHeight: 18,
                          itemOpacity: 0.75,
                          symbolSize: 12,
                          symbolShape: "circle",
                          symbolBorderColor: "rgba(0, 0, 0, .5)",
                          effects: [{
                              on: "hover",
                              style: {
                                  itemBackground: "rgba(0, 0, 0, .03)",
                                  itemOpacity: 1
                              }
                          }]
                        }
                    ]}
                /></div>}
              </Scrollbars>
              <FormControlLabel control={ <Checkbox checked={this.state.enabledPM1} onChange={this.onCheckedChange("enabledPM1")} value="pm1" color="primary" /> } label={strings.showPM1} />
              <FormControlLabel control={ <Checkbox checked={this.state.enabledPM2} onChange={this.onCheckedChange("enabledPM2")} value="pm2" color="primary" /> } label={strings.showPM2} />
              <FormControlLabel control={ <Checkbox checked={this.state.enabledTemp} onChange={this.onCheckedChange("enabledTemp")} value="temp" color="primary" /> } label={strings.showTemperature} />
              <FormControlLabel control={ <Checkbox checked={this.state.enabledHumidity} onChange={this.onCheckedChange("enabledHumidity")} value="humidity" color="primary" /> } label={strings.showHumidity} />
              <FormControlLabel control={ <Checkbox checked={this.state.enabledPressure} onChange={this.onCheckedChange("enabledPressure")} value="pressure" color="primary" /> } label={strings.showPressure} />
              <Typography variant="h6">{strings.zoomOfDiagram}</Typography>
              <br/>
              <Slider value={this.state.currentZoom} onChange={this.onZoomChange} min={1000} max={30000} step={1000} />
              <br/>
              <FormControlLabel control={ <Switch checked={this.state.enableTime} onChange={this.onCheckedChange("enableTime")} color="primary" /> } label={strings.showTime} />
              <FormControlLabel control={ <Switch checked={this.state.disableDots} onChange={this.onCheckedChange("disableDots")} color="primary" /> } label={strings.hideDots} />
              <FormControlLabel control={ <Switch checked={this.state.smoothCurve} onChange={this.onCheckedChange("smoothCurve")} color="primary" /> } label={strings.enableSoftCurve} />
              {this.state.smoothCurve && <FormControlLabel control={ <Switch checked={this.state.basisCurve} onChange={this.onCheckedChange("basisCurve")} color="primary" /> } label={strings.enableCurveSmoothing} />}
              {!this.state.smoothCurve && <FormControlLabel control={ <Switch checked={this.state.basisCurve} onChange={this.onCheckedChange("basisCurve")} color="primary" disabled/> } label={strings.enableCurveSmoothing} />}
              <FormControlLabel control={ <Switch checked={this.state.enabledEUThreshold} onChange={this.onCheckedChange("enabledEUThreshold")} color="primary" /> } label={strings.enableEUThreshold} />
              <FormControlLabel control={ <Switch checked={this.state.enabledWHOThreshold} onChange={this.onCheckedChange("enabledWHOThreshold")} color="primary" /> } label={strings.enableWHOThreshold} />
            </TabContainer>
            <TabContainer dir={theme.direction}>
              {this.state.data && <SensorDataTable data={this.state.data} />}
              {this.state.data === null && <Fragment>{strings.noData}</Fragment>}
            </TabContainer>
          </SwipeableViews>
        </Scrollbars>
      </Dialog>
    );
  }
}

FullScreenDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onOpenDetails: PropTypes.func.isRequired,
  sensor: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(FullScreenDialog);
