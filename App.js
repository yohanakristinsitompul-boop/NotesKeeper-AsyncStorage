import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  const STORAGE_KEY = "@notes";

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data !== null) {
        setNotes(JSON.parse(data));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const saveNotes = async (newNotes) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newNotes));
      setNotes(newNotes);
    } catch (error) {
      console.log(error);
    }
  };

  const addOrUpdateNote = () => {
    if (note.trim() === "") {
      Alert.alert("Peringatan", "Catatan tidak boleh kosong!");
      return;
    }

    if (editingId) {
      const updatedNotes = notes.map((item) =>
        item.id === editingId
          ? { ...item, title: note }
          : item
      );

      saveNotes(updatedNotes);
      setEditingId(null);
      setNote("");
      return;
    }

    const newNote = {
      id: Date.now().toString(),
      title: note,
    };

    const updatedNotes = [...notes, newNote];
    saveNotes(updatedNotes);
    setNote("");
  };

  const deleteNote = (id) => {
    const updatedNotes = notes.filter((item) => item.id !== id);
    saveNotes(updatedNotes);
  };

  const editNote = (item) => {
    setNote(item.title);
    setEditingId(item.id);
  };

  const clearAllNotes = () => {
    Alert.alert(
      "Konfirmasi",
      "Apakah yakin ingin menghapus semua catatan?",
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Ya",
          onPress: () => saveNotes([]),
        },
      ]
    );
  };

  const filteredNotes = notes.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.noteText}>{item.title}</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => editNote(item)}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteNote(item.id)}
        >
          <Text style={styles.buttonText}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📒 NotesKeeper</Text>

      <TextInput
        style={styles.input}
        placeholder="Masukkan catatan..."
        value={note}
        onChangeText={setNote}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={addOrUpdateNote}
      >
        <Text style={styles.buttonText}>
          {editingId ? "Update Catatan" : "Tambah Catatan"}
        </Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Cari catatan..."
        value={search}
        onChangeText={setSearch}
      />

      <TouchableOpacity
        style={styles.clearButton}
        onPress={clearAllNotes}
      >
        <Text style={styles.buttonText}>
          Hapus Semua
        </Text>
      </TouchableOpacity>

      {filteredNotes.length === 0 ? (
        <Text style={styles.empty}>
          Belum ada catatan.
        </Text>
      ) : (
        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
    flex: 1,
    padding: 20,
    marginTop: 50,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },

  addButton: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },

  clearButton: {
    backgroundColor: "#9C27B0",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
  },

  noteText: {
    fontSize: 16,
    marginBottom: 10,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  editButton: {
    backgroundColor: "#F9A825",
    width: "48%",
    padding: 10,
    borderRadius: 6,
  },

  deleteButton: {
    backgroundColor: "#E53935",
    width: "48%",
    padding: 10,
    borderRadius: 6,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },

  empty: {
    marginTop: 40,
    textAlign: "center",
    color: "gray",
    fontSize: 18,
  },
});