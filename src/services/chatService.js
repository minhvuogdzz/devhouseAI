import { db } from './firebase';
import { collection, addDoc, updateDoc, doc, getDocs, getDoc, query, where } from 'firebase/firestore';

// 1. Tạo một đoạn chat mới (Lần đầu user nhắn tin)
export const createNewChat = async (userId, firstUserMsg, messages) => {
  // Lấy 30 ký tự đầu của tin nhắn làm Tiêu đề (Title)
  const title = firstUserMsg.substring(0, 30) + (firstUserMsg.length > 30 ? '...' : '');
  
  const docRef = await addDoc(collection(db, 'chats'), {
    userId: userId,
    title: title,
    messages: messages,
    updatedAt: Date.now() // Lưu thời gian để sắp xếp chat mới nhất lên đầu
  });
  
  return { id: docRef.id, title };
};

// 2. Cập nhật tin nhắn vào đoạn chat đang mở
export const updateChat = async (chatId, newMessages) => {
  const chatRef = doc(db, 'chats', chatId);
  await updateDoc(chatRef, {
    messages: newMessages,
    updatedAt: Date.now()
  });
};

// 3. Lấy toàn bộ danh sách lịch sử chat của 1 User (để hiện lên Sidebar)
export const getUserChats = async (userId) => {
  const q = query(collection(db, 'chats'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  const chats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  // Sắp xếp chat nào vừa nhắn sẽ nằm trên cùng
  return chats.sort((a, b) => b.updatedAt - a.updatedAt);
};

// 4. Lấy chi tiết tin nhắn của 1 đoạn chat khi click vào Sidebar
export const getChatDetail = async (chatId) => {
  const chatRef = doc(db, 'chats', chatId);
  const snap = await getDoc(chatRef);
  if (snap.exists()) {
    return snap.data().messages;
  }
  return null;
};