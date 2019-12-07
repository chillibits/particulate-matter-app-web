import React, { Component } from 'react'
import * as Keys from '../keys';
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { Paper, Typography, Avatar, Grid, Button } from '@material-ui/core'
import { Map, InfoWindow, Marker, GoogleApiWrapper } from 'google-maps-react'
import Geocode from "react-geocode"
import IconButton from '@material-ui/core/IconButton';
import { SensorIcon } from './index'
import InfoIcon from '@material-ui/icons/InfoOutlined';
import strings from '../strings'

class MapContainer extends Component {
  state = {
    markers: [],
    old_markerData: [],
    showingInfoWindow: false,
    activeMarker: {},
    selectedPlace: {},
    selectedAddress: "",
    selectedMarkerLat: 0,
    selectedMarkerLng: 0,
    old_favourites: [],
    old_own_sensors: [],
  };

  constructor(props) {
    super(props)

    this.state.markers = this.props.markerData.map(marker => <Marker key={marker.i} icon={{ url: "markers/blue.png" }} title={marker.i} name={marker.i} onClick={this.onMarkerClick} position={{lat: marker.l, lng: marker.b}} />);
  }

  onMarkerClick = (props, marker, e) => {
    let currentComponent = this;
    Geocode.setApiKey(Keys.GOOGLE_GEOCODE_KEY);
    Geocode.fromLatLng(marker.position.lat(), marker.position.lng()).then(
      response => {
        var country = currentComponent.getCountry(response.results[0].address_components)
        var city = currentComponent.getCity(response.results[0].address_components)
        this.setState({
          selectedAddress: country+ ", " + city,
          country: country,
          city: city,
        });
      },
      error => {
        console.error(error);
      }
    );

    this.setState({ selectedPlace: props, activeMarker: marker, selectedMarkerLat: Math.round(marker.position.lat() * 1000) / 1000, selectedMarkerLng: Math.round(marker.position.lng() * 1000) / 1000, selectedAddress: strings.loading_address, showingInfoWindow: true });
  };

  getCountry = (addrComponents) => {
    for (var i = 0; i < addrComponents.length; i++) {
        if (addrComponents[i].types[0] === "country") return addrComponents[i].long_name;
        if (addrComponents[i].types.length === 2 && addrComponents[i].types[0] === "political") return addrComponents[i].long_name;
    }
    return strings.unknown_country;
  }

  getCity = (addrComponents) => {
    for (var i = 0; i < addrComponents.length; i++) {
        if (addrComponents[i].types[0] === "locality" || addrComponents[i].types[0] === "postal_town") return addrComponents[i].long_name;
        if (addrComponents[i].types.length === 2 && addrComponents[i].types[0] === "political") return addrComponents[i].long_name;
    }
    return strings.unknown_city;
  }

  onMapClicked = (props) => {
    if (this.state.showingInfoWindow) {
      this.setState({
        showingInfoWindow: false,
        activeMarker: null
      });
    }
  };

  onShowSensorDataClicked = () => {
    var sensor = { chip_id: this.state.activeMarker.name, name: this.state.selectedAddress, color: "#000000", fav: false };
    this.props.onShowSensorData(sensor);
  }

  onAddFavouriteClicked = () => {
    this.props.onAddFavourite(this.state.activeMarker.name);
  }

  showDetails = () => {
    var sensor = {
      chip_id: this.state.selectedPlace.name,
      name: this.state.selectedAddress
    }
    this.props.onOpenDetails(sensor);
  }

  onInfoWindowOpen(props, e) {
    const show_data = (<Button variant="outlined" color="primary" onClick={this.onShowSensorDataClicked} style={{marginTop: 5, width: 210}}>{strings.show_measurements}</Button>);
    ReactDOM.render(React.Children.only(show_data), document.getElementById("show_data"));
    const sensor_info = (<IconButton aria-label="info" onClick={this.showDetails}><InfoIcon color="primary"/></IconButton>);
    ReactDOM.render(React.Children.only(sensor_info), document.getElementById("sensor_info"));
    if(this.props.logged_in) {
      const add_favourite = (<Button variant="contained" color="primary" onClick={this.onAddFavouriteClicked} style={{marginTop: 5, width: 210}}>{strings.add_favourite}</Button>);
      ReactDOM.render(React.Children.only(add_favourite), document.getElementById("add_favourite"));
    }
  }

  render() {
    if(this.props.markerData !== this.state.old_markerData || this.props.favourites.length !== this.state.old_favourites.length || this.props.own_sensors.length !== this.state.old_own_sensors.length) {
      var markers = this.props.markerData.map(marker => {
        var image_url = "markers/blue.png";
        this.props.favourites.map(sensor => {
          if(sensor.chip_id === marker.i) image_url = "markers/red.png";
          return true;
        });
        this.props.own_sensors.map(sensor => {
          if(sensor.chip_id === marker.i) image_url = "markers/green.png";
          return true;
        });
        return <Marker key={marker.i} icon={{ url: image_url }} title={marker.i} name={marker.i} onClick={this.onMarkerClick} position={{lat: marker.l, lng: marker.b}} />;
      });
      this.setState({ markers: markers, old_markerData: this.props.markerData, old_favourites: this.props.favourites, old_own_sensors: this.props.own_sensors });
    }

    return (
      <Map google={this.props.google} onClick={this.onMapClicked} zoom={7} initialCenter={{lat: (this.props.ownPosition.lat), lng: (this.props.ownPosition.lng) }}>
        {this.state.markers}
        <InfoWindow marker={this.state.activeMarker} visible={this.state.showingInfoWindow} onOpen={e => {this.onInfoWindowOpen(this.props, e)}}>
            <Paper elevation={1} style={{width: 210}}>
              <div>
                <Grid container>
                  <Grid item xs={3}>
                    <Avatar><SensorIcon/></Avatar>
                  </Grid>
                  <Grid item xs={9}>
                    <Typography variant="body2" noWrap>{this.state.selectedPlace.name}</Typography>
                    <Typography noWrap><i>{this.state.selectedMarkerLat}, {this.state.selectedMarkerLng}</i></Typography>
                  </Grid>
                </Grid>
                <div id="sensor_info" style={{ position: "absolute", right: 15, top: 5, width: 45, height: 45 }}/>
                <Typography>{this.state.selectedAddress}</Typography>
                <div id="show_data" style={{height: 50}}/>
                {this.props.logged_in && <div id="add_favourite" style={{height: 50}}/>}
              </div>
            </Paper>
        </InfoWindow>
      </Map>
    );
  }
}

MapContainer.propTypes = {
  markerData: PropTypes.array.isRequired,
  favourites: PropTypes.array.isRequired,
  own_sensors: PropTypes.array.isRequired,
  ownPosition: PropTypes.object.isRequired,
  logged_in: PropTypes.bool.isRequired,
  onShowSensorData: PropTypes.func.isRequired,
  onAddFavourite: PropTypes.func.isRequired,
  onOpenDetails: PropTypes.func.isRequired,
}

export default GoogleApiWrapper({ apiKey: (Keys.GOOGLE_API_KEY), language: ("de") })(MapContainer)
