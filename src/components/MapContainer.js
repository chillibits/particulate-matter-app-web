import React, { Component } from "react";
import * as Keys from "../keys";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { Paper, Typography, Avatar, Grid, Button } from "@material-ui/core";
import { Map, InfoWindow, Marker, GoogleApiWrapper } from "google-maps-react";
import Geocode from "react-geocode";
import IconButton from "@material-ui/core/IconButton";
import { SensorIcon } from "./index";
import InfoIcon from "@material-ui/icons/InfoOutlined";
import strings from "../strings";

class MapContainer extends Component {
  state = {
    markers: [],
    oldMarkerData: [],
    showingInfoWindow: false,
    activeMarker: {},
    selectedPlace: {},
    selectedAddress: "",
    selectedMarkerLat: 0,
    selectedMarkerLng: 0,
    oldFavorites: [],
    oldOwnSensors: [],
  };

  constructor(props) {
    super(props);
    // this.state.markers = this.props.markerData.map(marker => <Marker key={marker.i} icon={{ url: "markers/blue.png" }} title={marker.i} name={marker.i} onClick={this.onMarkerClick} position={{lat: marker.l, lng: marker.b}} />);
  }

  onMarkerClick = (props, marker, e) => {
    let currentComponent = this;
    Geocode.setApiKey(Keys.GOOGLE_GEOCODE_KEY);
    Geocode.fromLatLng(marker.position.lat(), marker.position.lng()).then(
      (response) => {
        var country = currentComponent.getCountry(response.results[0].address_components);
        var city = currentComponent.getCity(response.results[0].address_components);
        this.setState({
          selectedAddress: country + ", " + city,
          country: country,
          city: city,
        });
      },
      (error) => {}
    );

    this.setState({ selectedPlace: props, activeMarker: marker, selectedMarkerLat: Math.round(marker.position.lat() * 1000) / 1000, selectedMarkerLng: Math.round(marker.position.lng() * 1000) / 1000, selectedAddress: strings.loadingAddress, showingInfoWindow: true });
  };

  getCountry = (addrComponents) => {
    for (var i = 0; i < addrComponents.length; i++) {
        if (addrComponents[i].types[0] === "country") return addrComponents[i].long_name;
        if (addrComponents[i].types.length === 2 && addrComponents[i].types[0] === "political") return addrComponents[i].long_name;
    }
    return strings.unknownCountry;
  }

  getCity = (addrComponents) => {
    for (var i = 0; i < addrComponents.length; i++) {
        if (addrComponents[i].types[0] === "locality" || addrComponents[i].types[0] === "postal_town") return addrComponents[i].long_name;
        if (addrComponents[i].types.length === 2 && addrComponents[i].types[0] === "political") return addrComponents[i].long_name;
    }
    return strings.unknownCity;
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
    var sensor = { chipId: this.state.activeMarker.name, name: this.state.selectedAddress, color: "#000000", fav: false };
    this.props.onShowSensorData(sensor);
  }

  onAddFavouriteClicked = () => {
    this.props.onAddFavourite(this.state.activeMarker.name);
  }

  showDetails = () => {
    var sensor = {
      chipId: this.state.selectedPlace.name,
      name: this.state.selectedAddress
    }
    this.props.onOpenDetails(sensor);
  }

  onInfoWindowOpen(props, e) {
    const showData = (<Button variant="outlined" color="primary" onClick={this.onShowSensorDataClicked} style={{marginTop: 5, width: 210}}>{strings.showMeasurements}</Button>);
    ReactDOM.render(React.Children.only(showData), document.getElementById("showData"));
    const sensorInfo = (<IconButton aria-label="info" onClick={this.showDetails}><InfoIcon color="primary"/></IconButton>);
    ReactDOM.render(React.Children.only(sensorInfo), document.getElementById("sensorInfo"));
    if(this.props.signedIn) {
      const addFavourite = (<Button variant="contained" color="primary" onClick={this.onAddFavouriteClicked} style={{marginTop: 5, width: 210}}>{strings.addFavourite}</Button>);
      ReactDOM.render(React.Children.only(addFavourite), document.getElementById("addFavourite"));
    }
  }

  render() {
    if(this.props.markerData !== this.state.oldMarkerData || this.props.favorites.length !== this.state.oldFavorites.length || this.props.ownSensors.length !== this.state.oldOwnSensors.length) {
      var markers = this.props.markerData.map((marker) => {
        var imageUrl = "markers/blue.png";
        this.props.favorites.map(sensor => {
          if(sensor.chipId === marker.i) imageUrl = "markers/red.png";
          return true;
        });
        this.props.ownSensors.map(sensor => {
          if(sensor.chipId === marker.i) imageUrl = "markers/green.png";
          return true;
        });
        // Attention: !== does not work!
        if(marker.l != 0 || marker.b != 0) return <Marker key={marker.i} icon={{ url: imageUrl }} title={marker.i} name={marker.i} onClick={this.onMarkerClick} position={{lat: marker.l, lng: marker.b}} />;
      });
      this.setState({ markers: markers, oldMarkerData: this.props.markerData, oldFavorites: this.props.favorites, oldOwnSensors: this.props.ownSensors });
    }

    return (
      <Map google={this.props.google} onClick={this.onMapClicked} zoom={7} initialCenter={{lat: (this.props.ownPosition.lat), lng: (this.props.ownPosition.lng) }}>
        {this.state.markers}
        <InfoWindow marker={this.state.activeMarker} visible={this.state.showingInfoWindow} onOpen={(e) => { this.onInfoWindowOpen(this.props, e); }}>
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
                <div id="sensorInfo" style={{ position: "absolute", right: 15, top: 5, width: 45, height: 45 }}/>
                <Typography>{this.state.selectedAddress}</Typography>
                <div id="showData" style={{height: 50}}/>
                {this.props.signedIn && <div id="addFavourite" style={{height: 50}}/>}
              </div>
            </Paper>
        </InfoWindow>
      </Map>
    );
  }
}

MapContainer.propTypes = {
  markerData: PropTypes.array.isRequired,
  favorites: PropTypes.array.isRequired,
  ownSensors: PropTypes.array.isRequired,
  ownPosition: PropTypes.object.isRequired,
  signedIn: PropTypes.bool.isRequired,
  onShowSensorData: PropTypes.func.isRequired,
  onAddFavourite: PropTypes.func.isRequired,
  onOpenDetails: PropTypes.func.isRequired,
};

export default GoogleApiWrapper({ apiKey: Keys.GOOGLE_API_KEY, language: "de" })(MapContainer);
