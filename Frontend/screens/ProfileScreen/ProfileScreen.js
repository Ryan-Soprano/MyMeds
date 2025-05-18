import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useDependent } from '../../context/DependentContext';

const ProfileScreen = ({ navigation }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { isManaging, currentUser, previousUser, startManaging, stopManaging } = useDependent();
  // Mock user data
  //CHANGE THIS TO YOUR USER
  const [user, setUser] = useState({
    name: 'Luke Foret',
    role: '(your role/status goes here)',
    profileImage: null, // Start with no image
    dependents: [
      { id: 1, name: 'Grandma', icon: null },
    ]
  });

  const handleBackToMainAccount = () => {
    stopManaging(); // This should reset the context state
    setUser({  // Reset the local user state
      name: 'Luke Foret', // Replace with your actual main account name
      role: 'Primary Account',
      profileImage: null,
      dependents: [
        { id: 1, name: 'Grandma', icon: null },
      ]
    });
    navigation.navigate('Home');
  };

  // Update user data if managing dependent
  useEffect(() => {
    if (isManaging && currentUser) {
      setUser(currentUser);
    } else if (!isManaging && previousUser) {
      setUser(previousUser);
    }
  }, [isManaging, currentUser, previousUser]);

  const toggleDarkMode = () => {
    Alert.alert("Dark Mode", "Sorry, this feature is still in development.");
  };

  const toggleNotifications = () => {
    Alert.alert("Notifications", "Sorry, this feature is still in development.");
  }

  const takePhoto = async () => {
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos');
      return;
    }
    
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    
    if (!result.canceled) {
      // Update user profile image
      // In a real app, you would upload this to your server
      setUser(prevUser => ({
        ...prevUser,
        profileImage: result.assets[0].uri
      }));
    }
  };
  
  const pickImage = async () => {
    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Media library permission is required to select photos');
      return;
    }
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    
    if (!result.canceled) {
      // Update user profile image
      // In a real app, you would upload this to your server
      setUser(prevUser => ({
        ...prevUser,
        profileImage: result.assets[0].uri
      }));
    }
  };
  
  // Then update the handleSelectImage function:
  const handleSelectImage = () => {
    Alert.alert(
      'Profile Picture',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: takePhoto,
        },
        {
          text: 'Choose from Gallery',
          onPress: pickImage,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => Alert.alert('Account Deletion', 'Your account deletion request has been submitted.')
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: () => {
            Alert.alert('Logged Out', 'You have been successfully logged out.');
            // Navigate to the login screen
            navigation.reset({
              index: 0,
              routes: [{ name: 'Auth' }],
            });
          }
        }
      ]
    );
  };

  const handleDependentPress = (dependent) => {
    Alert.alert(
      dependent.name,
      `Would you like to manage ${dependent.name}'s account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Manage',
          onPress: () => {
            startManaging(user, {
              ...user,
              name: dependent.name,
              role: 'Dependent Account',
              profileImage: dependent.icon,
              dependents: [] // Dependents don't have their own dependents
            });
            navigation.navigate('MainApp', { 
              screen: 'Home',
              params: { isManagingDependent: true }
            });
          }
        }
      ]
    );
  };

  const handleAddDependent = () => {
    // Reset form fields
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    // Show modal
    setModalVisible(true);
  };

  // Add back button when managing
  React.useLayoutEffect(() => {
    if (isManaging) {
      navigation.setOptions({
        headerLeft: () => (
          <TouchableOpacity 
            onPress={() => {
              stopManaging();
              navigation.navigate('Home');
            }}
            style={{ marginLeft: 15 }}
          >
            <Text style={{ color: '#0288D1', fontSize: 16 }}>Back to My Account</Text>
          </TouchableOpacity>
        )
      });
    } else {
      navigation.setOptions({
        headerLeft: undefined
      });
    }
  }, [isManaging, navigation, stopManaging]);

  const handleSubmitDependent = () => {
    // Validate form
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }
    
    if (!password) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    // Add new dependent
    const newDependent = {
      id: user.dependents.length + 1,
      name: username,
      icon: null
    };
    
    setUser(prevUser => ({
      ...prevUser,
      dependents: [...prevUser.dependents, newDependent]
    }));
    
    // Close modal and show success message
    setModalVisible(false);
    Alert.alert('Success', `${username} has been added as a dependent`);
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Back Button - Visible only when managing dependent */}
      {isManaging && (
        <TouchableOpacity 
          onPress={handleBackToMainAccount}
          style={styles.backButtonContainer}
        >
          <FontAwesome5 name="arrow-left" size={16} color="#0288D1" />
          <Text style={styles.backButtonText}>Back to My Account</Text>
        </TouchableOpacity>
      )}
  
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.container}>
        {/* Profile Header Section */}
        <View style={[styles.headerGradient, { backgroundColor: '#0288D1' }]}>
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              {user.profileImage ? (
                <Image
                  source={{ uri: user.profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={[styles.profileImage, styles.emptyProfileImage]}>
                  <MaterialCommunityIcons name="account" size={60} color="#BDBDBD" />
                </View>
              )}
              <TouchableOpacity 
                style={styles.editImageButton}
                onPress={handleSelectImage}
              >
                <MaterialCommunityIcons name="camera" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.profileName}>
              {isManaging ? currentUser?.name : user.name}
            </Text>
            <Text style={styles.profileRole}>
              {isManaging ? 'Dependent Account' : 'Primary Account'}
            </Text>
            <TouchableOpacity style={styles.editProfileButton}>
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
  
        {/* Dependents Section - Only shown for primary account */}
        {!isManaging && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dependents</Text>
            {user.dependents.map((dependent) => (
              <TouchableOpacity 
                key={dependent.id}
                style={styles.linkedAccountItem}
                onPress={() => handleDependentPress(dependent)}
              >
                <View style={styles.accountIconContainer}>
                  {dependent.icon ? (
                    <FontAwesome5 name={dependent.icon} size={20} color="#0288D1" />
                  ) : (
                    <MaterialCommunityIcons name="account" size={20} color="#0288D1" />
                  )}
                </View>
                <View style={styles.accountDetails}>
                  <Text style={styles.accountName}>{dependent.name}</Text>
                  <Text style={styles.accountStatus}>Dependent</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#757575" />
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={styles.addAccountButton}
              onPress={handleAddDependent}
            >
              <Ionicons name="add-circle-outline" size={20} color="#0288D1" />
              <Text style={styles.addAccountText}>Add New Dependent</Text>
            </TouchableOpacity>
          </View>
        )}
  
        {/* Settings Section - Shown for all accounts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="moon-outline" size={22} color="#0288D1" />
            </View>
            <Text style={styles.settingText}>Dark Mode</Text>
            <Switch
              trackColor={{ false: "#E0E0E0", true: "#81D4FA" }}
              thumbColor={darkMode ? "#0288D1" : "#f4f3f4"}
              ios_backgroundColor="#E0E0E0"
              onValueChange={toggleDarkMode}
              value={darkMode}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="notifications-outline" size={22} color="#0288D1" />
            </View>
            <Text style={styles.settingText}>Notifications</Text>
            <Switch
              trackColor={{ false: "#E0E0E0", true: "#81D4FA" }}
              thumbColor={notifications ? "#0288D1" : "#f4f3f4"}
              ios_backgroundColor="#E0E0E0"
              onValueChange={toggleNotifications}
              value={notifications}
            />
          </View>
        </View>
  
        {/* Account Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Management</Text>
          
          <TouchableOpacity style={styles.accountOption}>
            <View style={styles.accountOptionIconContainer}>
              <MaterialCommunityIcons name="lock-outline" size={22} color="#0288D1" />
            </View>
            <Text style={styles.accountOptionText}>Change Password</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#757575" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.accountOption}>
            <View style={styles.accountOptionIconContainer}>
              <MaterialCommunityIcons name="swap-horizontal" size={22} color="#0288D1" />
            </View>
            <Text style={styles.accountOptionText}>Change Role</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#757575" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.accountOption}>
            <View style={styles.accountOptionIconContainer}>
              <MaterialCommunityIcons name="shield-account-outline" size={22} color="#0288D1" />
            </View>
            <Text style={styles.accountOptionText}>Privacy Settings</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#757575" />
          </TouchableOpacity>
        </View>
  
        {/* Logout and Delete Section */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <MaterialCommunityIcons name="logout" size={20} color="#0288D1" />
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.deleteButton]}
            onPress={handleDeleteAccount}
          >
            <MaterialCommunityIcons name="delete-outline" size={20} color="#F44336" />
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
  
        {/* App Info Section */}
        <View style={styles.appInfoSection}>
          <Text style={styles.appVersion}>MyMeds App Version 1.0.0</Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.footerDot}>•</Text>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Terms of Service</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
  
      {/* Add Dependent Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Dependent</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Enter dependent's username"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                secureTextEntry
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm password"
                secureTextEntry
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmitDependent}
              >
                <Text style={styles.submitButtonText}>Add Dependent</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButtonText: {
    color: '#0288D1',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 30,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'white',
  },
  emptyProfileImage: {
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0288D1',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  profileRole: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 15,
  },
  editProfileButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  editProfileText: {
    color: 'white',
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginHorizontal: 15,
    marginTop: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 15,
  },
  linkedAccountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  accountIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  accountStatus: {
    fontSize: 14,
    marginTop: 2,
    color: '#757575',
  },
  addAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 5,
  },
  addAccountText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#0288D1',
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
  },
  accountOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  accountOptionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  accountOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  logoutButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  logoutButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#0288D1',
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#FFF8F8',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  deleteButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#F44336',
    fontWeight: '500',
  },
  appInfoSection: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  appVersion: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 10,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLink: {
    fontSize: 14,
    color: '#0288D1',
  },
  footerDot: {
    fontSize: 14,
    color: '#757575',
    marginHorizontal: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    color: '#757575',
    fontWeight: '500',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#0288D1',
    marginLeft: 10,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  // New styles for dependent management
  dependentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dependentHeaderText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#0288D1',
    fontWeight: '500',
  },
  disabledText: {
    color: '#757575',
    textAlign: 'center',
    padding: 15,
  },
  disabledButton: {
    opacity: 0.5,
  },
  floatingBackButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: '#0288D1',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  floatingBackButtonText: {
    color: 'white',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ProfileScreen;



