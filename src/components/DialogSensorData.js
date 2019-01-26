import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import LinearProgress from '@material-ui/core/LinearProgress';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Tooltip from '@material-ui/core/Tooltip';
import SwipeableViews from 'react-swipeable-views';
import { MuiPickersUtilsProvider, DatePicker } from 'material-ui-pickers';
import DateFnsUtils from '@date-io/date-fns';
import deLocale from 'date-fns/locale/de';
import { SensorIcon } from './index'
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import Edit from '@material-ui/icons/Edit';
import { SensorDataTable } from './index';
import { Scrollbars } from 'react-custom-scrollbars';
import CSV from 'csv-string';
import moment from 'moment';
import { ResponsiveLine } from '@nivo/line'
import Slider from '@material-ui/lab/Slider';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Switch from '@material-ui/core/Switch';

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
    position: 'relative',
  },
  flex: {
    flex: 1,
  },
  card: {
    minWidth: 275,
    margin: 15,
  },
  card_content: {
    height: 50,
    padding: 5
  },
  date_selection: {
    marginTop: 10,
  },
});

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

function round(x, n) {
    return Math.round(x * Math.pow(10, n)) / Math.pow(10, n)
}

class FullScreenDialog extends React.Component {
  state = {
    data: undefined,
    data_pm10 : [],
    data_pm2_5 : [],
    data_temp : [],
    data_humidity : [],
    data_pressure : [],
    data_graph: [],
    loading: true,
    picker: null,
    open: false,
    value: 0,
    default_date:  new Date(),
    selected_date: new Date(),
    dialog_details_open: false,
    current_zoom: 10000,
    enabled_pm10: true,
    enabled_pm2_5: true,
    enabled_temp: false,
    enabled_humidity: false,
    enabled_pressure: false,
  };

  constructor(props) {
    super(props)

    this.loadSensorData();
  }

  loadSensorData = () => {
    this.setState({ loading: true });

    let currentComponent = this;
    counter = 0;
    fetch('https://h2801469.stratoserver.net/contents.php?path=esp8266-' + this.props.sensor.chip_id + '/data-' + moment(this.state.selected_date).format('YYYY-MM-DD') + '.csv')
    .then((r) => r.text())
    .then(result  => {
      var arr = CSV.parse(result);

      var data_records = [];
      var data_records_graph = [];
      var list_pm1 = [];
      var list_pm2 = [];
      var list_temp = [];
      var list_humidity = [];
      var list_pressure = [];

      var row_index = 0;
      arr.map(function(record) {
        if(row_index > 0) {
          var time = new Date();
          var pm1 = 0.0;
          var pm2 = 0.0;
          var temp = 0.0;
          var humidity = 0.0;
          var pressure = 0.0;
          if(record[0] !== "") time = record[0];
          if(record[1] !== "") pm1 = record[1];
          if(record[2] !== "") pm1 = record[2];
          if(record[3] !== "") pm1 = record[3];
          if(record[4] !== "") pm2 = record[4];
          if(record[5] !== "") pm2 = record[5];
          if(record[6] !== "") pm2 = record[6];
          if(record[7] !== "") pm1 = record[7];
          if(record[8] !== "") pm2 = record[8];
          if(record[9] !== "") temp = record[9];
          if(record[10] !== "") humidity = record[10];
          if(record[11] !== "") temp = record[11];
          if(record[12] !== "") pressure = record[12];
          if(record[13] !== "") temp = record[13];
          if(record[14] !== "") humidity = record[14];
          if(record[15] !== "") pressure = record[15];
          if(record[20] !== "") pm1 = record[20];
          if(record[21] !== "") pm2 = record[21];
          if(record[22] !== "") pm1 = record[22];
          if(record[23] !== "") pm2 = record[23];

          temp = round(temp, 1);
          humidity = round(humidity, 1);
          pressure = round(pressure / 100, 2);

          data_records.push(createData(time.substring(11), pm1, pm2, temp, humidity, pressure));
          time = new Date(time);
          var pm1_double = parseFloat(pm1);
          var pm2_double = parseFloat(pm2);
          var temp_double = parseFloat(temp);
          var humidity_double = parseFloat(humidity);
          var pressure_double = parseFloat(pressure);
          list_pm1.push({ x: time, y: pm1_double });
          list_pm2.push({ x: time, y: pm2_double });
          list_temp.push({ x: time, y: temp_double });
          list_humidity.push({ x: time, y: humidity_double });
          list_pressure.push({ x: time, y: pressure_double });
        }
        row_index++;
        return true;
      })

      if(this.state.enabled_pm10) data_records_graph.push({ id: "PM10", color: "hsl(353, 70%, 50%)", data: list_pm1 });
      if(this.state.enabled_pm2_5) data_records_graph.push({ id: "PM2,5", color: "hsl(87, 70%, 50%)", data: list_pm2 });
      if(this.state.enabled_temp) data_records_graph.push({ id: "Temperatur", color: "hsl(183, 70%, 50%)", data: list_temp });
      if(this.state.enabled_humidity) data_records_graph.push({ id: "Luftfeuchtigkeit", color: "hsl(281, 70%, 50%)", data: list_humidity });
      if(this.state.enabled_pressure) data_records_graph.push({ id: "Luftdruck", color: "hsl(61, 70%, 50%)", data: list_pressure });

      currentComponent.setState({ data: data_records, data_graph: data_records_graph, data_pm10: list_pm1, data_pm2_5: list_pm2, data_temp: list_temp, data_humidity: list_humidity, data_pressure: list_pressure, loading: false});
    })
  }

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  showDetails = () => {
    this.props.onOpenDetails(this.props.sensor);
  }

  handleTabChange = (event, value) => {
    this.setState({ value });
  };

  handleTabChangeIndex = index => {
    this.setState({ value: index });
  };

  openPicker = () => {
    this.picker.open();
  };

  minusDay = () => {
    var date = this.state.selected_date;
    this.setState({ selected_date: new Date(date.setTime(date.getTime() - 86400000 /* 1 Tag */))});
    this.loadSensorData();
  }

  plusDay = () => {
    var date = this.state.selected_date;
    this.setState({ selected_date: new Date(date.setTime(date.getTime() + 86400000 /* 1 Tag */))});
    this.loadSensorData();
  }

  handleDateChange = date => {
    this.setState({ selected_date: date });
    this.loadSensorData();
  }

  onZoomChange = (event, value) => {
    this.setState({ current_zoom: value });
  }

  onCheckedChange = name => event => {
    var data = [];
    if(name === "enabled_pm10" && event.target.checked) {
      data.push({ id: "PM10", color: "hsl(353, 70%, 50%)", data: this.state.data_pm10 });
    } else if(name !== "enabled_pm10" && this.state.enabled_pm10) {
      data.push({ id: "PM10", color: "hsl(353, 70%, 50%)", data: this.state.data_pm10 });
    }
    if(name === "enabled_pm2_5" && event.target.checked) {
      data.push({ id: "PM2,5", color: "hsl(87, 70%, 50%)", data: this.state.data_pm2_5 });
    } else if(name !== "enabled_pm2_5" && this.state.enabled_pm2_5) {
      data.push({ id: "PM2,5", color: "hsl(87, 70%, 50%)", data: this.state.data_pm2_5 });
    }
    if(name === "enabled_temp" && event.target.checked) {
      data.push({ id: "Temperatur", color: "hsl(183, 70%, 50%)", data: this.state.data_temp });
    } else if(name !== "enabled_temp" && this.state.enabled_temp) {
      data.push({ id: "Temperatur", color: "hsl(183, 70%, 50%)", data: this.state.data_temp });
    }
    if(name === "enabled_humidity" && event.target.checked) {
      data.push({ id: "Luftfeuchtigkeit", color: "hsl(281, 70%, 50%)", data: this.state.data_humidity });
    } else if(name !== "enabled_humidity" && this.state.enabled_humidity) {
      data.push({ id: "Luftfeuchtigkeit", color: "hsl(281, 70%, 50%)", data: this.state.data_humidity });
    }
    if(name === "enabled_pressure" && event.target.checked) {
      data.push({ id: "Luftdruck", color: "hsl(61, 70%, 50%)", data: this.state.data_pressure });
    } else if(name !== "enabled_pressure" && this.state.enabled_pressure) {
      data.push({ id: "Luftdruck", color: "hsl(61, 70%, 50%)", data: this.state.data_pressure });
    }
    this.setState({ [name]: event.target.checked, data_graph: data });
  }

  render() {
    const { classes, theme } = this.props;

    return (
      <Dialog fullScreen open={this.props.opened} onClose={this.props.onClose} TransitionComponent={Transition} >
        <AppBar className={classes.appBar}>
          <Toolbar>
            <Tooltip title="Sensordetails anzeigen">
              <IconButton color="inherit" onClick={this.showDetails} aria-label="Details anzeigen"><SensorIcon /></IconButton>
            </Tooltip>
            <Typography variant="h6" color="inherit" className={classes.flex}>{this.props.sensor.name} - ChipID: {this.props.sensor.chip_id}</Typography>
            <Tooltip title="Fenster schließen">
              <IconButton color="inherit" onClick={this.props.onClose} aria-label="Close"><CloseIcon /></IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>
        {this.state.loading && <LinearProgress />}
        <Card className={classes.card}>
          <CardContent className={classes.card_content}>
            <Tooltip title="Tag davor">
              <IconButton aria-label="Tag davor" onClick={this.minusDay}><KeyboardArrowLeft /></IconButton>
            </Tooltip>
            <MuiPickersUtilsProvider utils={DateFnsUtils} locale={deLocale}>
              <DatePicker value={this.state.selected_date} onChange={this.handleDateChange} className={classes.date_selection} showTodayButton disableFuture cancelLabel="Abbrechen" todayLabel="Heute" okLabel="OK" invalidLabel="Ungültige Eingabe" format="dd.MM.yyyy" ref={node => { this.picker = node; }}/>
            </MuiPickersUtilsProvider>
            <Tooltip title="Anderes Datum wählen">
              <IconButton aria-label="Datum bearbeiten"onClick={this.openPicker}><Edit /></IconButton>
            </Tooltip>
            {this.state.selected_date >= this.state.default_date && <Tooltip title="Tag danach"><IconButton aria-label="Tag danach" onClick={this.plusDay} disabled><KeyboardArrowRight disabled/></IconButton></Tooltip>}
            {this.state.selected_date < this.state.default_date && <Tooltip title="Tag danach"><IconButton aria-label="Tag danach" onClick={this.plusDay}><KeyboardArrowRight /></IconButton></Tooltip>}
          </CardContent>
        </Card>
        <AppBar position="static" color="default">
          <Tabs value={this.state.value} onChange={this.handleTabChange} indicatorColor="primary" textColor="primary" variant="fullWidth">
            <Tab label="Diagramm" />
            <Tab label="Datensätze" />
          </Tabs>
        </AppBar>
        <Scrollbars>
          <SwipeableViews axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'} index={this.state.value} onChangeIndex={this.handleTabChangeIndex} style={{overflowX: "hidden"}} animateHeight>
            <TabContainer dir={theme.direction} style={{overflowX: "hidden"}}>
              <Scrollbars style={{height: 600, overflowX: "hidden"}}>
                {this.state.data_graph !== [] && <div style={{height: 590, width: this.state.current_zoom}}><ResponsiveLine
                  data={this.state.data_graph}
                  margin={{
                      "top": 10,
                      "right": 50,
                      "bottom": 40,
                      "left": 30
                  }}
                  xScale={{
                      "type": 'time',
                      "format": 'native',
                      "precision": 'minute'
                  }}
                  yScale={{
                      "type": "linear",
                      "stacked": false,
                      "min": "auto",
                      "max": "auto"
                  }}
                  curve={this.state.smooth_curve ? (this.state.basis_curve ? "basis" : "cardinal") : "linear"}
                  axisBottom={{
                      "orient": "bottom",
                      "tickSize": 5,
                      "tickPadding": 5,
                      "tickRotation": 0,
                      "legend": "Uhrzeit",
                      "legendOffset": 35,
                      "format": '%H:%m',
                      "legendPosition": "middle"
                  }}
                  axisLeft={{
                      "orient": "left",
                      "tickSize": 5,
                      "tickPadding": 5,
                      "tickRotation": 0,
                      "legend": "Messwert",
                      "legendOffset": -40,
                      "legendPosition": "middle"
                  }}
                  colors="category10"
                  lineWidth={1}
                  dotSize={this.state.disable_dots ? 0 : 5}
                  dotColor="inherit:darker(0.3)"
                  enableDotLabel={true}
                  dotLabel={this.state.enable_time ? (function(e){return"".concat(moment(e.x).format("HH:mm"),"")}) : ""}
                  dotLabelYOffset={-12}
                  dotBorderWidth={0}
                  animate={false}
                  motionStiffness={90}
                  motionDamping={15}
                  legends={[{
                          "anchor": "bottom-right",
                          "direction": "row",
                          "justify": false,
                          "translateX": 25,
                          "translateY": 40,
                          "itemsSpacing": 10,
                          "itemDirection": "left-to-right",
                          "itemWidth": 100,
                          "itemHeight": 18,
                          "itemOpacity": 0.75,
                          "symbolSize": 12,
                          "symbolShape": "circle",
                          "symbolBorderColor": "rgba(0, 0, 0, .5)",
                          "effects": [{
                              "on": "hover",
                              "style": {
                                  "itemBackground": "rgba(0, 0, 0, .03)",
                                  "itemOpacity": 1
                              }
                          }]
                        }
                    ]}
                /></div>}
              </Scrollbars>
              <FormControlLabel control={ <Checkbox checked={this.state.enabled_pm10} onChange={this.onCheckedChange('enabled_pm10')} value="pm10" color="primary" /> } label="PM10-Kurve anzeigen" />
              <FormControlLabel control={ <Checkbox checked={this.state.enabled_pm2_5} onChange={this.onCheckedChange('enabled_pm2_5')} value="pm2_5" color="primary" /> } label="PM2,5-Kurve anzeigen" />
              <FormControlLabel control={ <Checkbox checked={this.state.enabled_temp} onChange={this.onCheckedChange('enabled_temp')} value="temp" color="primary" /> } label="Temperatur-Kurve anzeigen" />
              <FormControlLabel control={ <Checkbox checked={this.state.enabled_humidity} onChange={this.onCheckedChange('enabled_humidity')} value="humidity" color="primary" /> } label="Luftfeuchtigkeit-Kurve anzeigen" />
              <FormControlLabel control={ <Checkbox checked={this.state.enabled_pressure} onChange={this.onCheckedChange('enabled_pressure')} value="pressure" color="primary" /> } label="Luftdruck-Kurve anzeigen" />
              <Typography variant="h6">Zoom des Diagrammes:</Typography>
              <br/>
              <Slider value={this.state.current_zoom} onChange={this.onZoomChange} min={1000} max={30000} step={1000} />
              <br/>
              <FormControlLabel control={ <Switch checked={this.state.enable_time} onChange={this.onCheckedChange('enable_time')} color="primary" /> } label="Messzeiten einblenden" />
              <FormControlLabel control={ <Switch checked={this.state.disable_dots} onChange={this.onCheckedChange('disable_dots')} color="primary" /> } label="Punkte ausblenden" />
              <FormControlLabel control={ <Switch checked={this.state.smooth_curve} onChange={this.onCheckedChange('smooth_curve')} color="primary" /> } label="Weiche Kurve aktivieren" />
              {this.state.smooth_curve && <FormControlLabel control={ <Switch checked={this.state.basis_curve} onChange={this.onCheckedChange('basis_curve')} color="primary" /> } label="Kurvenglättung aktivieren" />}
              {!this.state.smooth_curve && <FormControlLabel control={ <Switch checked={this.state.basis_curve} onChange={this.onCheckedChange('basis_curve')} color="primary" disabled/> } label="Kurvenglättung aktivieren" />}
            </TabContainer>
            <TabContainer dir={theme.direction}>
              {this.state.data && <SensorDataTable data={this.state.data} />}
              {this.state.data === undefined && <Fragment>Keine Daten vorhanden</Fragment>}
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
