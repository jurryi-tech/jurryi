import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import {
  Text,
  Card,
  Button,
  TextInput,
  Appbar,
  Avatar,
  Divider,
  Snackbar,
  Portal,
  Dialog,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import api from '@/services/api';
import {
  formatPhoneNumber,
  getStateLabel,
  getDistrictLabel,
  getProblemTypeLabel,
} from '@/utils/helpers';
import { COLORS } from '@/utils/constants';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function InfoRow({
  label,
  value,
  editing,
  editValue,
  onChangeText,
}: {
  label: string;
  value: string;
  editing?: boolean;
  editValue?: string;
  onChangeText?: (text: string) => void;
}) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      {editing && onChangeText ? (
        <TextInput
          mode="outlined"
          value={editValue ?? value}
          onChangeText={onChangeText}
          style={infoStyles.input}
          dense
          outlineColor="#e0e0e0"
          activeOutlineColor="#1a237e"
        />
      ) : (
        <Text style={infoStyles.value}>{value || 'Not set'}</Text>
      )}
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    paddingVertical: 10,
  },
  label: {
    fontSize: 12,
    color: '#757575',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    color: '#212121',
  },
  input: {
    backgroundColor: '#ffffff',
    fontSize: 14,
  },
});

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { updateProfile, isUpdating, error, clearError } = useUserStore();

  const [editing, setEditing] = useState(false);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Edit state
  const [editFullName, setEditFullName] = useState(user?.fullName ?? '');
  const [editAge, setEditAge] = useState(user?.profile?.age?.toString() ?? '');
  const [editGender, setEditGender] = useState(user?.profile?.gender ?? '');
  const [editOccupation, setEditOccupation] = useState(
    user?.profile?.occupation ?? '',
  );
  const [editIncomeCategory, setEditIncomeCategory] = useState(
    user?.profile?.incomeCategory ?? '',
  );
  const [editUrgency, setEditUrgency] = useState(
    user?.profile?.urgencyLevel ?? '',
  );
  const [editOpposingParty, setEditOpposingParty] = useState(
    user?.profile?.opposingPartyType ?? '',
  );

  const handleStartEditing = useCallback(() => {
    setEditFullName(user?.fullName ?? '');
    setEditAge(user?.profile?.age?.toString() ?? '');
    setEditGender(user?.profile?.gender ?? '');
    setEditOccupation(user?.profile?.occupation ?? '');
    setEditIncomeCategory(user?.profile?.incomeCategory ?? '');
    setEditUrgency(user?.profile?.urgencyLevel ?? '');
    setEditOpposingParty(user?.profile?.opposingPartyType ?? '');
    setEditing(true);
  }, [user]);

  const handleCancelEditing = useCallback(() => {
    setEditing(false);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      await updateProfile({
        fullName: editFullName || undefined,
        profile: {
          age: editAge ? parseInt(editAge, 10) : undefined,
          gender: editGender || undefined,
          occupation: editOccupation || undefined,
          incomeCategory: editIncomeCategory || undefined,
          urgencyLevel: editUrgency || undefined,
          opposingPartyType: editOpposingParty || undefined,
        },
      });
      setEditing(false);
      setSnackbarMessage('Profile updated successfully');
      setSnackbarVisible(true);
    } catch {
      setSnackbarMessage(error || 'Failed to update profile');
      setSnackbarVisible(true);
    }
  }, [
    editFullName,
    editAge,
    editGender,
    editOccupation,
    editIncomeCategory,
    editUrgency,
    editOpposingParty,
    updateProfile,
    error,
  ]);

  const handleLogout = useCallback(async () => {
    setLogoutDialogVisible(false);
    await logout();
    router.replace('/(auth)/login');
  }, [logout, router]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all conversation history. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeletingAccount(true);
              await api.delete('/user/account');
              await logout();
              router.replace('/(auth)/login');
            } catch {
              setIsDeletingAccount(false);
              setSnackbarMessage('Failed to delete account. Please try again.');
              setSnackbarVisible(true);
            }
          },
        },
      ],
    );
  }, [logout, router]);

  const formatLabel = (value: string | undefined): string => {
    if (!value) return 'Not set';
    return value
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Appbar.Header style={styles.header} elevated>
          <Appbar.Content title="Profile" titleStyle={styles.headerTitle} />
        </Appbar.Header>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 12, fontSize: 14, color: '#757575' }}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Appbar.Header style={styles.header} elevated>
        <Appbar.Content title="Profile" titleStyle={styles.headerTitle} />
        {!editing ? (
          <Appbar.Action
            icon="pencil"
            iconColor="#1a237e"
            onPress={handleStartEditing}
          />
        ) : (
          <>
            <Appbar.Action
              icon="close"
              iconColor="#757575"
              onPress={handleCancelEditing}
            />
            <Appbar.Action
              icon="check"
              iconColor="#1a237e"
              onPress={handleSave}
            />
          </>
        )}
      </Appbar.Header>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar & Basic Info */}
        <View style={styles.avatarSection}>
          <Avatar.Text
            size={80}
            label={getInitials(user.fullName)}
            style={styles.avatar}
            labelStyle={styles.avatarLabel}
          />
          {editing ? (
            <TextInput
              mode="outlined"
              label="Full Name"
              value={editFullName}
              onChangeText={setEditFullName}
              style={styles.nameInput}
              dense
              outlineColor="#e0e0e0"
              activeOutlineColor="#1a237e"
            />
          ) : (
            <Text style={styles.userName}>{user.fullName}</Text>
          )}
          <Text style={styles.userPhone}>
            {formatPhoneNumber(user.phone)}
          </Text>
        </View>

        {/* Personal Information */}
        <Card style={styles.card} mode="outlined">
          <Card.Content>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <Divider style={styles.divider} />

            <InfoRow
              label="State"
              value={user.state ? getStateLabel(user.state) : 'Not set'}
            />
            <InfoRow
              label="District"
              value={
                user.state && user.district
                  ? getDistrictLabel(user.state, user.district)
                  : 'Not set'
              }
            />
            <InfoRow
              label="Problem Type"
              value={
                user.primaryProblemType
                  ? getProblemTypeLabel(user.primaryProblemType)
                  : 'Not set'
              }
            />
            <InfoRow
              label="Language"
              value={formatLabel(user.preferredLanguage)}
            />
          </Card.Content>
        </Card>

        {/* Profile Details */}
        <Card style={styles.card} mode="outlined">
          <Card.Content>
            <Text style={styles.sectionTitle}>Profile Details</Text>
            <Divider style={styles.divider} />

            <InfoRow
              label="Age"
              value={user.profile?.age?.toString() ?? 'Not set'}
              editing={editing}
              editValue={editAge}
              onChangeText={setEditAge}
            />
            <InfoRow
              label="Gender"
              value={formatLabel(user.profile?.gender)}
              editing={editing}
              editValue={editGender}
              onChangeText={setEditGender}
            />
            <InfoRow
              label="Occupation"
              value={user.profile?.occupation ?? 'Not set'}
              editing={editing}
              editValue={editOccupation}
              onChangeText={setEditOccupation}
            />
            <InfoRow
              label="Income Category"
              value={formatLabel(user.profile?.incomeCategory)}
              editing={editing}
              editValue={editIncomeCategory}
              onChangeText={setEditIncomeCategory}
            />
            <InfoRow
              label="Urgency Level"
              value={formatLabel(user.profile?.urgencyLevel)}
              editing={editing}
              editValue={editUrgency}
              onChangeText={setEditUrgency}
            />
            <InfoRow
              label="Opposing Party"
              value={formatLabel(user.profile?.opposingPartyType)}
              editing={editing}
              editValue={editOpposingParty}
              onChangeText={setEditOpposingParty}
            />
          </Card.Content>
        </Card>

        {/* Logout */}
        <Button
          mode="outlined"
          onPress={() => setLogoutDialogVisible(true)}
          style={styles.logoutButton}
          labelStyle={styles.logoutButtonLabel}
          icon="logout"
        >
          Logout
        </Button>

        {/* Delete Account - Required by Google Play */}
        <Button
          mode="outlined"
          onPress={handleDeleteAccount}
          style={styles.deleteAccountButton}
          labelStyle={styles.deleteAccountButtonLabel}
          icon="delete-forever"
          disabled={isDeletingAccount}
        >
          {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
        </Button>
      </ScrollView>

      {/* Logout Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={logoutDialogVisible}
          onDismiss={() => setLogoutDialogVisible(false)}
        >
          <Dialog.Title>Logout</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to logout?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLogoutDialogVisible(false)}>Cancel</Button>
            <Button
              onPress={handleLogout}
              textColor="#d32f2f"
            >
              Logout
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => {
          setSnackbarVisible(false);
          clearError();
        }}
        duration={3000}
        style={
          snackbarMessage.includes('success')
            ? styles.successSnackbar
            : styles.errorSnackbar
        }
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#ffffff',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a237e',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  avatar: {
    backgroundColor: '#1a237e',
    marginBottom: 12,
  },
  avatarLabel: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#212121',
  },
  userPhone: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  nameInput: {
    width: '80%',
    backgroundColor: '#ffffff',
    marginBottom: 4,
  },
  card: {
    marginBottom: 16,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 4,
  },
  divider: {
    marginBottom: 4,
  },
  logoutButton: {
    marginTop: 8,
    borderColor: '#d32f2f',
    borderRadius: 8,
  },
  logoutButtonLabel: {
    color: '#d32f2f',
    fontWeight: '600',
  },
  deleteAccountButton: {
    marginTop: 12,
    borderColor: '#b71c1c',
    borderRadius: 8,
  },
  deleteAccountButtonLabel: {
    color: '#b71c1c',
    fontWeight: '600',
  },
  successSnackbar: {
    backgroundColor: '#2e7d32',
  },
  errorSnackbar: {
    backgroundColor: '#d32f2f',
  },
});
