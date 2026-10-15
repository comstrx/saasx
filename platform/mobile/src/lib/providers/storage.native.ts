import AsyncStorage from "@react-native-async-storage/async-storage";
import { driverStore, type Store } from "engine/storage";

export const store: Store = driverStore(AsyncStorage);
