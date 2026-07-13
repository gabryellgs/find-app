import React from "react";
import { StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";

const colors = { primaryDark: "#0B3A4A" };

/** Mapa nativo (iOS/Android) com um marcador na posição do item. */
export default function ItemLocationMap({ latitude, longitude }) {
  return (
    <MapView
      style={styles.map}
      pointerEvents="none"
      scrollEnabled={false}
      zoomEnabled={false}
      region={{
        latitude,
        longitude,
        latitudeDelta: 0.006,
        longitudeDelta: 0.006,
      }}
    >
      <Marker coordinate={{ latitude, longitude }} pinColor={colors.primaryDark} />
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { width: "100%", height: 150, borderRadius: 16 },
});
