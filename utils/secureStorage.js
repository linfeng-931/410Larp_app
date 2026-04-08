import * as SecureStore from 'expo-secure-store';

// 儲存密碼
export const savePassword = async (key, value) => {
  try {
    await SecureStore.setItemAsync(key, value);
    console.log("密碼已安全存入");
  } catch (error) {
    console.error("儲存失敗", error);
  }
};

// 讀取密碼
export const getPassword = async (key) => {
  try {
    const result = await SecureStore.getItemAsync(key);
    if (result) {
      return result;
    } else {
      console.log("找不到該項資料");
      return null;
    }
  } catch (error) {
    console.error("讀取失敗", error);
  }
};