'use client';

import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { Box, Stack, Typography, Modal, TextField, Button } from "@mui/material";

const darkGreen = "#004d40";
const white = "#ffffff";
const searchBarBg = "#f0f0f0"; // Light gray background for search bar
const searchBarTextColor = "#333"; // Dark gray text color for search bar

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");

  const updateInventory = async () => {
    const collectionRef = collection(firestore, "pantry");
    const snapshot = await getDocs(collectionRef);
    const inventoryList = snapshot.docs.map((doc) => ({
      name: doc.id,
      ...doc.data(),
    }));
    setInventory(inventoryList);
  };

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, "pantry"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "pantry"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Filter inventory based on search query
  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box bgcolor={darkGreen} color={white} p={4}>
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor={white}
          border={`2px solid ${darkGreen}`}
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%, -50%)",
          }}
        >
          <Typography variant="h6">Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName);
                setItemName(""); // Clear the input field after adding
                handleClose(); // Close the modal after adding
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Box bgcolor={searchBarBg} p={2} mb={3}>
        <TextField
          variant="outlined"
          placeholder="Search items..."
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            style: {
              color: searchBarTextColor, // Set search bar text color
            },
          }}
        />
      </Box>

      <Box bgcolor={white} color={darkGreen} p={4}>
        <Typography variant="h2" align="center" gutterBottom>
          Inventory Items
        </Typography>

        <Stack spacing={2}>
          {filteredInventory.map(({ name, quantity }) => (
            <Box
              key={name}
              width="100%"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              bgcolor="#f0f0f0"
              p={2}
            >
              <Typography variant="h6" textAlign="center">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>

              <Typography variant="h6" textAlign="center">
                {quantity}
              </Typography>

              <Stack direction="row" spacing={2}>
                <Button variant="contained" onClick={() => addItem(name)}>
                  Add
                </Button>

                <Button variant="contained" onClick={() => removeItem(name)}>
                  Remove
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>

      <Button variant="contained" onClick={handleOpen}>
        Add New Item
      </Button>
    </Box>
  );
}