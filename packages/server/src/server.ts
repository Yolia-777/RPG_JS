import { Server } from '@signe/room';
import { MapRoom } from "./Rooms/Map";

export class RpgServerEngine extends Server {
  rooms = [
    MapRoom
  ]
}