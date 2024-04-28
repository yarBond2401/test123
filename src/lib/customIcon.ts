import { Icon } from 'leaflet';

import MapIcon from "@/images/pin.png"

export const customIcon = new Icon({
  iconUrl: MapIcon.src,
  iconSize: [25, 32],
  iconAnchor: [12.5, 32],
  popupAnchor: [0, -32],
});
