import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Photo } from "@/types";
import { db, isFirebaseReady } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";

interface PhotoContextValue {
  photos: Record<string, Photo[]>;
  getPhotos: (jobId: string) => Photo[];
  loadPhotos: (jobId: string) => Promise<void>;
  addPhoto: (jobId: string, photo: Photo) => void;
  updatePhoto: (jobId: string, photoId: string, updates: Partial<Photo>) => void;
  deletePhoto: (jobId: string, photoId: string) => void;
  clearPhotos: (jobId: string) => void;
}

const PhotoContext = createContext<PhotoContextValue | null>(null);

export function PhotoProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<Record<string, Photo[]>>({});

  const useFirestore = isFirebaseReady() && !!db && !!user;

  const getPhotos = useCallback((jobId: string): Photo[] => {
    return photos[jobId] || [];
  }, [photos]);

  const loadPhotos = useCallback(async (jobId: string) => {
    if (!useFirestore || !db || !user) return;

    const photosQuery = query(
      collection(db, "photos"),
      where("jobId", "==", jobId),
      where("userId", "==", user.uid),
      orderBy("uploadedAt", "asc")
    );

    const snapshot = await getDocs(photosQuery);
    const fetched = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        jobId: data.jobId,
        url: data.url,
        storagePath: data.storagePath,
        extractedData: data.extractedData ?? {},
        uploadedAt: data.uploadedAt?.toDate ? data.uploadedAt.toDate() : new Date(),
        status: data.status ?? "COMPLETE",
        userId: data.userId,
      } as Photo;
    });

    setPhotos((prev) => ({ ...prev, [jobId]: fetched }));
  }, [useFirestore, user]);

  const addPhoto = useCallback((jobId: string, photo: Photo) => {
    setPhotos(prev => ({
      ...prev,
      [jobId]: [...(prev[jobId] || []), photo],
    }));
  }, []);

  const updatePhoto = useCallback((jobId: string, photoId: string, updates: Partial<Photo>) => {
    setPhotos(prev => ({
      ...prev,
      [jobId]: (prev[jobId] || []).map(p => 
        p.id === photoId ? { ...p, ...updates } : p
      ),
    }));
  }, []);

  const deletePhoto = useCallback((jobId: string, photoId: string) => {
    setPhotos(prev => ({
      ...prev,
      [jobId]: (prev[jobId] || []).filter(p => p.id !== photoId),
    }));
  }, []);

  const clearPhotos = useCallback((jobId: string) => {
    setPhotos(prev => {
      const next = { ...prev };
      delete next[jobId];
      return next;
    });
  }, []);

  return (
    <PhotoContext.Provider value={{ photos, getPhotos, loadPhotos, addPhoto, updatePhoto, deletePhoto, clearPhotos }}>
      {children}
    </PhotoContext.Provider>
  );
}

export function usePhotoContext() {
  const context = useContext(PhotoContext);
  if (!context) {
    throw new Error("usePhotoContext must be used within a PhotoProvider");
  }
  return context;
}

export function usePhotos(jobId: string) {
  const { getPhotos, loadPhotos, addPhoto, updatePhoto, deletePhoto } = usePhotoContext();
  
  return {
    photos: getPhotos(jobId),
    loadPhotos: () => loadPhotos(jobId),
    addPhoto: (photo: Photo) => addPhoto(jobId, photo),
    updatePhoto: (photoId: string, updates: Partial<Photo>) => updatePhoto(jobId, photoId, updates),
    deletePhoto: (photoId: string) => deletePhoto(jobId, photoId),
  };
}
