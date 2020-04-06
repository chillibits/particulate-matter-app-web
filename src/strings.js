import LocalizedStrings from "localized-strings";

export default new LocalizedStrings({
  en: {
    appName: "Particulate Matter App",
    actionSuccessful: "Action completed successfully",
    sensorAddedSuccessfully: "Sensor added successfully!",
    errorPleaseTryAgain: "Error! Please try again.",
    sensorFavourized: "Sensor favourized successfully!",
    favourizationFailedTryAgain: "Favourization failed! Please try again.",
    changesSaved: "Changings saved successfully!",
    changesSaveFailed: "The changings could not be saved! Please try again.",
    sensorRemovedSuccessfully: "Removed sensor successfully!",
    sensorRemovalFailed: "Sensor removal failed! Please try again.",
    addSensor: "Add sensor",
    unknownSensor: "Unknown sensor",
    sensors: "sensors",
    ourHomepage: "Our homepage",
    downloadAndroidApp: "Download Android app",
    info: "Info",
    addSensorTofavorites: "Add sensor to favorites",
    displayName: "Display name",
    chipId: "Chip id",
    cancel: "Cancel",
    ok: "OK",
    save: "Save",
    back: "Back",
    next: "Next",
    skip: "Skip",
    addFavourite: "Add favourite",
    errorAddSensor: "You entered a wrong chip id or the option 'Feinstaub-App' in the APIs category is not enabled in the configuration of your sensor. After it is enabled, it can last up to 10 minutes until our server receives data from the sensor.",
    enterChipId: "Enter chip id",
    enterChipIdInstruction1: "Please enter the chip id of your sensor below. You can find the id in the configuration of your sensor. If you still not find the chip id, you can check out the entry on our",
    enterChipIdInstruction2: ".",
    faqSite: "FAQ site",
    enterGeneralData: "Enter general data",
    displayNameColorInstruction: "Please choose a display name and a color for sensor within the diagrams",
    addSensorToMap: "Add sensor to the map",
    addSensorToMapInstruction1: "To add your sensor to the map, you have to enter the exact location and the mounting height of the sensor <b>over the ground </b>.<br><b>HINT:</b> This values only can be changed afterwards, if you",
    addSensorToMapInstruction2: ".",
    contact: "Send us an email",
    availableSoon: "Available soon",
    latitude: "Latitude",
    longitude: "Longitude",
    mountingHeight: "Mounting height (meters)",
    chooseLocation: "Choose location of sensor",
    editSensor: "Edit sensor",
    removeSensor: "Remove sensor",
    removeSensorMessage1: "Do you really want to remove the sensor with the chip id",
    removeSensorMessage2: "? You could link it again at any time.",
    remove: "Remove",
    pm1: "PM10",
    pm2: "PM2.5",
    temperature: "Temperature",
    humidity: "Humidity",
    pressure: "Pressure",
    showSensorDetails: "Show sensor details",
    showDetails: "Show details",
    closeWindow: "Close window",
    dayBefore: "Day before",
    dayAfter: "Day after",
    chooseAnotherDate: "Choose another date",
    diagram: "Diagram",
    dataRecords: "Data records",
    timeOfDay: "Time",
    measurement: "Measurement",
    showPM1: "Show PM10 curve",
    showPM2: "Show PM2.5 curve",
    showTemperature: "Show temperature curve",
    showHumidity: "Show humidity curve",
    showPressure: "Show pressure curve",
    showTime: "Show measurement time",
    hideDots: "Hide dots",
    enableSoftCurve: "Enable soft curve",
    enableCurveSmoothing: "Enable curve smoothing",
    zoomOfDiagram: "Zoom of the diagram:",
    noData: "No data existing",
    loading: "Loading ...",
    sensorDetails: "Sensor details",
    public: "Public",
    firmwareVersion: "Firmware version",
    onlineSince: "Online since",
    linkWithAndroidApp: "Link with android app",
    linkInstruction1: "To synchronize your sensors and your favorites,",
    linkInstruction2: "start the Particulate Matter App.",
    linkInstruction3: "Three dots at the top right corner → 'Web version'.",
    linkInstruction4: "Scan the qr code above.",
    showMeasurements: "Show measurements",
    properties: "Properties",
    nofavorites: "No favorites existing yet. To add a favourite, click on a sensor on the map and select 'Add favourite'.",
    noOwnSensors1: "If you have an particulate matter sensor from",
    noOwnSensors2: ", you can link it here. Click on the '+' button in the bottom right corner on the page.",
    favorites: "My favorites",
    ownSensors: "Own sensors",
    loadingAddress: "Loading address ...",
    unknownCountry: "Unknown country",
    unknownCity: "Unknown city",
    delete: "Delete",
    previousPage: "Previous page",
    nextPage: "Next page",
    searchLocation: "Search location ...",
    isThisTheRightPlace: "Is this the right place? If not, please try to switch the coordinats.",
    enableEUThreshold: "Enable EU Threshold",
    enableWHOThreshold: "Enable WHO Threshold",
    euThreshold: "EU Threshold",
    whoThreshold: "WHO Threshold",
  },
  de: {
    appName: "Feinstaub-App",
    actionSuccessful: "Die Aktion war erfolgreich!",
    sensorAddedSuccessfully: "Sensor erfolgreich hinzugefügt!",
    errorPleaseTryAgain: "Fehler! Bitte versuchen Sie es erneut.",
    sensorFavourized: "Der Sensor wurde favorisiert!",
    favourizationFailedTryAgain: "Favorisieren fehlgeschlagen! Bitte versuchen Sie es erneut.",
    changesSaved: "Änderungen erfolgreich gespeichert!",
    changesSaveFailed: "Die Änderungen konnten nicht gespeichert werden! Bitte versuchen Sie es erneut.",
    sensorRemovedSuccessfully: "Sensor erfolgreich entfernt!",
    sensorRemovalFailed: "Entfernen fehlgeschlagen! Bitte versuchen Sie es erneut.",
    addSensor: "Sensor hinzufügen",
    unknownSensor: "Unbekannter Sensor",
    sensors: "Sensoren",
    ourHomepage: "Unsere Homepage",
    downloadAndroidApp: "Android-App herunterladen",
    info: "Info",
    addSensorTofavorites: "Sensor zu Favoriten hinzufügen",
    displayName: "Anzeigename",
    chipId: "Chip-ID",
    cancel: "Abbrechen",
    ok: "OK",
    save: "Speichern",
    back: "Zurück",
    next: "Weiter",
    skip: "Überspringen",
    addFavourite: "Favorit hinzufügen",
    errorAddSensor: "Sie haben entweder die falsche Chip-ID angegeben oder in der Konfiguration Ihres Sensors ist die Option 'Feinstaub-App' unter APIs nicht aktiviert. Nachdem die Option aktiviert ist, kann es bis zu 10 Minuten dauern, bis Daten auf dem Server ankommen.",
    enterChipId: "Chip-ID angeben",
    enterChipIdInstruction1: "Bitte geben Sie die Chip-ID Ihres Sensors in das Feld unten ein. Sie finden die ID in der Konfiguration Ihres Sensors. Falls Sie die Chip-ID dennoch nicht finden sollten, finden Sie auf unserer",
    enterChipIdInstruction2: "einen Eintrag",
    faqSite: "FAQ-Seite",
    enterGeneralData: "Basisdaten angeben",
    displayNameColorInstruction: "Bitte vergeben Sie für Ihren Sensor einen Anzeigenamen und bestimmen Sie eine Farbe für den Sensor innerhalb der Diagramme.",
    addSensorToMap: "Sensor auf die Karte bringen",
    addSensorToMapInstruction1: "Um Ihren Sensor auf die Karte zu bekommen, müssen Sie die genaue Position des Sensors und die Montagehöhe über dem Boden angeben.\nHINWEIS: Diese Daten können später nur noch geändert werden, indem Sie per E-Mail mit uns in",
    addSensorToMapInstruction2: "treten.",
    contact: "Kontakt",
    availableSoon: "Bald verfügbar",
    latitude: "Längengrad",
    longitude: "Breitengrad",
    mountingHeight: "Montagehöhe (Meter)",
    chooseLocation: "Position des Sensors wählen",
    editSensor: "Sensor bearbeiten",
    removeSensor: "Sensor entfernen",
    removeSensorMessage1: "Wollen Sie den Sensor mit der Chip-ID",
    removeSensorMessage2: "wirklich entfernen? Sie können ihn jederzeit wieder verknüpfen.",
    remove: "Entfernen",
    pm1: "PM10",
    pm2: "PM2,5",
    temperature: "Temperatur",
    humidity: "Luftfeuchtigkeit",
    pressure: "Luftdruck",
    showSensorDetails: "Sensordetails anzeigen",
    showDetails: "Details anzeigen",
    closeWindow: "Fenster schließen",
    dayBefore: "Tag davor",
    dayAfter: "Tag danach",
    chooseAnotherDate: "Anderes Datum wählen",
    diagram: "Diagramm",
    dataRecords: "Datensätze",
    timeOfDay: "Uhrzeit",
    measurement: "Messwert",
    showPM1: "PM10-Kurve anzeigen",
    showPM2: "PM2,5-Kurve anzeigen",
    showTemperature: "Temperatur-Kurve anzeigen",
    showHumidity: "Luftfeuchtigkeit-Kurve anzeigen",
    showPressure: "Luftdruck-Kurve anzeigen",
    showTime: "Messzeiten einblenden",
    hideDots: "Punkte ausblenden",
    enableSoftCurve: "Weiche Kurve aktivieren",
    enableCurveSmoothing: "Kurvenglättung aktivieren",
    zoomOfDiagram: "Zoom des Diagrammes:",
    noData: "Keine Daten vorhanden",
    loading: "Laden ...",
    sensorDetails: "Sensor Details",
    public: "Öffentlich",
    firmwareVersion: "Firmware Version",
    onlineSince: "Online seit",
    linkWithAndroidApp: "Mit der Android-App verknüpfen",
    linkInstruction1: "Um Ihre Sensoren und Ihre Favoriten aus der App",
    linkInstruction2: "hier anzuzeigen, starten Sie die Feinstaub-App.",
    linkInstruction3: "Drei Punkte oben rechts → 'Web-Version'.",
    linkInstruction4: "Scannen Sie den obigen QR-Code.",
    showMeasurements: "Messwerte anzeigen",
    properties: "Eigenschaften",
    nofavorites: "Noch keine Favoriten vorhanden. Um Favoriten hinzuzufügen, tippen Sie auf der Karte auf einen Sensor und wählen Sie 'Favorit hinzufügen'.",
    noOwnSensors1: "Falls Sie einen eigenen Feinstaubsensor von",
    noOwnSensors2: "haben, können Sie ihn hier verknüpfen. Klicken Sie auf den '+'-Button ganz unten rechts auf der Seite.",
    favorites: "Meine Favoriten",
    ownSensors: "Meine Sensoren",
    loadingAddress: "Adresse wird geladen ...",
    unknownCountry: "Unbekanntes Land",
    unknownCity: "Unbekannte Stadt",
    delete: "Löschen",
    previousPage: "Vorherige Seite",
    nextPage: "Nächste Seite",
    searchLocation: "Ort suchen ...",
    isThisTheRightPlace: "Ist dies der korrekte Standort? Falls nicht, versuchen Sie die Koordinaten zu vertauschen.",
    enableEUThreshold: "EU Grenzwert aktivieren",
    enableWHOThreshold: "WHO Grenzwert aktivieren",
    euThreshold: "EU Grenzwert",
    whoThreshold: "WHO Grenzwert",
  },
  fr: {
    appName: "App Matière Particulaire",
    actionSuccessful: "Action terminée avec succès",
    sensorAddedSuccessfully: "Capteur ajouté avec succès!",
    errorPleaseTryAgain: "Erreur! Veuillez réessayer.",
    sensorFavourized: "Capteur favorisé avec succès!",
    favourizationFailedTryAgain: "La favorisation a échoué! Veuillez réessayer.",
    changesSaved: "Les modifications ont été enregistrées avec succès!",
    changesSaveFailed: "Les modifications n'ont pas pu être enregistrées! Veuillez réessayer.",
    sensorRemovedSuccessfully: "Capteur supprimé avec succès!",
    sensorRemovalFailed: "Le retrait du capteur a échoué! Veuillez réessayer.",
    addSensor: "Ajouter un capteur",
    unknownSensor: "Capteur inconnu",
    sensors: "capteurs",
    ourHomepage: "Notre page d'accueil",
    downloadAndroidApp: "Téléchargez l'application Android",
    info: "Info",
    addSensorTofavorites: "Ajouter le capteur aux favoris",
    displayName: "Nom d'affichage",
    chipId: "Chip ID",
    cancel: "Annuler",
    ok: "OK",
    save: "Sauver",
    back: "Retour",
    next: "Prochain",
    skip: "Sauter",
    addFavourite: "Ajouter un favori",
    errorAddSensor: "Vous avez inséré un mauvaise Puce-ID ou l'option 'Feinstaub-App' dans la catégorie des APIs n'est pas activée dans la configuration de votre capteur. Une fois activé, il peut durer jusqu'à 10 minutes jusqu'à ce que notre serveur reçoive des données du capteur.",
    enterChipId: "Entrez Puce-ID",
    enterChipIdInstruction1: "Veuillez insérer la Puce-ID de puce de votre capteur ci-dessous. Vous pouvez trouver la Puce-ID dans la configuration de votre capteur. Si vous ne trouvez toujours pas l'identifiant de la puce, vous pouvez consulter l'entrée sur notre",
    enterChipIdInstruction2: ".",
    faqSite: "site de FAQ",
    enterGeneralData: "Enter general data",
    displayNameColorInstruction: "Veuillez choisir un nom d'affichage et une couleur pour le capteur et dans les diagrammes",
    addSensorToMap: "Ajouter un capteur à la carte",
    addSensorToMapInstruction1: "Pour ajouter votre capteur à la carte, vous devez entrer l'emplacement exact et la hauteur de montage du capteur <b>sur le sol. </b>.<br><b>ALLUSION:</b> Ces valeurs ne peuvent être modifiées qu'après, si vous",
    addSensorToMapInstruction2: ".",
    contact: "Envoyez-nous un e-mail",
    availableSoon: "Bientôt disponible",
    latitude: "Latitude",
    longitude: "Longitude",
    mountingHeight: "Hauteur de montage (mètres)",
    chooseLocation: "Choisissez l'emplacement du capteur",
    editSensor: "Modifier le capteur",
    removeSensor: "Retirer le capteur",
    removeSensorMessage1: "Voulez-vous vraiment retirer le capteur avec la Puce-ID",
    removeSensorMessage2: "? Vous pouvez le lier à nouveau à tout moment.",
    remove: "Retirer",
    pm1: "PM10",
    pm2: "PM2.5",
    temperature: "Température",
    humidity: "Humidité",
    pressure: "Pression",
    showSensorDetails: "Afficher les détails du capteur",
    showDetails: "Afficher les détails",
    closeWindow: "Fermez le cadre",
    dayBefore: "Jour précédent",
    dayAfter: "Jour suivant",
    chooseAnotherDate: "Choisissez une autre date",
    diagram: "Diagramme",
    dataRecords: "Enregistrements de données",
    timeOfDay: "Temps",
    measurement: "La mesure",
    showPM1: "Afficher la courbe de PM10",
    showPM2: "Afficher la courbe de PM2,5",
    showTemperature: "Afficher la courbe de température",
    showHumidity: "Afficher la courbe d'humidité",
    showPressure: "Afficher la courbe de pression",
    showTime: "Afficher le temps de mesure",
    hideDots: "Cacher les points",
    enableSoftCurve: "Activer la courbe douce",
    enableCurveSmoothing: "Activer le lissage de courbe",
    zoomOfDiagram: "Zoom sur le diagramme:",
    noData: "Aucune donnée existante",
    loading: "Chargement ...",
    sensorDetails: "Détails du capteur",
    public: "Public",
    firmwareVersion: "Version du firmware",
    onlineSince: "En ligne depuis",
    linkWithAndroidApp: "Lien avec l'application Android",
    linkInstruction1: "Pour synchroniser vos capteurs et vos favoris,",
    linkInstruction2: "démarrez l'App Matière Particulaire.",
    linkInstruction3: "Trois points dans le coin supérieur droit →'Version Web'.",
    linkInstruction4: "Scannez le code QR ci-dessus.",
    showMeasurements: "Afficher les mesures",
    properties: "Propriétés",
    nofavorites: "Aucun favori n'existe encore. Pour ajouter un favori, cliquez sur un capteur sur la carte et sélectionnez 'Ajouter un favori'.",
    noOwnSensors1: "Si vous avez un capteur de matière particulaire",
    noOwnSensors2: ", vous pouvez le lier ici. Cliquez sur le bouton '+' dans le coin inférieur droit de la page.",
    favorites: "Mes favoris",
    ownSensors: "Propres capteurs",
    loadingAddress: "Adresse en chargement ...",
    unknownCountry: "Pays inconnu",
    unknownCity: "Ville inconnue",
    delete: "Supprimer",
    previousPage: "Page précédente",
    nextPage: "Page suivante",
    searchLocation: "Rechercher un lieu ...",
    isThisTheRightPlace: "Est-ce le bon endroit? Sinon, essayez de changer les coordonnées.",
    enableEUThreshold: "Activer le seuil de l'UE",
    enableWHOThreshold: "Activer le seuil de l'OMS",
    euThreshold: "Seuil de l'UE",
    whoThreshold: "Seuil de l'OMS",
  }},
);
