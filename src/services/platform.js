/**
 * Platform algılama yardımcıları.
 *
 * @capacitor/core web'de de güvenle yüklenir (native köprü yoksa "web" döner),
 * bu yüzden statik import edilebilir. Native-only eklentiler (AdMob vb.)
 * ise her zaman dinamik import() ile yüklenmelidir.
 */
import { Capacitor } from '@capacitor/core';

/** 'web' | 'android' | 'ios' */
export const getPlatform = () => {
  try {
    return Capacitor.getPlatform();
  } catch (e) {
    return 'web';
  }
};

/** Uygulama Capacitor native kabuğunda (Android/iOS) mı çalışıyor? */
export const isNativeApp = () => {
  try {
    return Capacitor.isNativePlatform();
  } catch (e) {
    return false;
  }
};

export const isAndroid = () => getPlatform() === 'android';

export const isWeb = () => !isNativeApp();

/** Belirli bir native eklentinin bu platformda kullanılabilir olup olmadığı. */
export const isPluginAvailable = (name) => {
  try {
    return Capacitor.isPluginAvailable(name);
  } catch (e) {
    return false;
  }
};
