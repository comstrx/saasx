import { driverStore, type Store } from "@engine/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const store: Store = driverStore(AsyncStorage);
