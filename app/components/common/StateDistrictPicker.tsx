import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
  TextInput as RNTextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import {
  COLORS,
  INDIAN_STATES,
  DISTRICTS,
  SelectOption,
} from '../../utils/constants';
import Input from './Input';

interface StateDistrictPickerProps {
  selectedState: string;
  selectedDistrict: string;
  onStateChange: (state: string) => void;
  onDistrictChange: (district: string) => void;
}

interface SearchableModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: SelectOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

const SearchableModal: React.FC<SearchableModalProps> = ({
  visible,
  onClose,
  title,
  options,
  selectedValue,
  onSelect,
}) => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const query = search.toLowerCase().trim();
    return options.filter((opt) => opt.label.toLowerCase().includes(query));
  }, [options, search]);

  const handleSelect = (value: string) => {
    onSelect(value);
    setSearch('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <IconButton icon="close" size={22} onPress={onClose} />
          </View>

          <View style={styles.searchContainer}>
            <RNTextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor={COLORS.textSecondary}
              value={search}
              onChangeText={setSearch}
              autoFocus
            />
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => {
              const isSelected = item.value === selectedValue;
              return (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    isSelected && styles.optionItemSelected,
                  ]}
                  onPress={() => handleSelect(item.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {isSelected && (
                    <IconButton
                      icon="check"
                      size={18}
                      iconColor={COLORS.primary}
                      style={styles.checkIcon}
                    />
                  )}
                </TouchableOpacity>
              );
            }}
            style={styles.optionsList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No results found</Text>
              </View>
            }
            keyboardShouldPersistTaps="handled"
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const StateDistrictPicker: React.FC<StateDistrictPickerProps> = ({
  selectedState,
  selectedDistrict,
  onStateChange,
  onDistrictChange,
}) => {
  const [stateModalVisible, setStateModalVisible] = useState(false);
  const [districtModalVisible, setDistrictModalVisible] = useState(false);

  const selectedStateLabel = useMemo(() => {
    const state = INDIAN_STATES.find((s) => s.value === selectedState);
    return state?.label || '';
  }, [selectedState]);

  const selectedDistrictLabel = useMemo(() => {
    if (!selectedState || !selectedDistrict) return '';
    const districts = DISTRICTS[selectedState];
    if (districts) {
      const district = districts.find((d) => d.value === selectedDistrict);
      return district?.label || selectedDistrict;
    }
    return selectedDistrict;
  }, [selectedState, selectedDistrict]);

  const hasPreDefinedDistricts = selectedState && DISTRICTS[selectedState];

  const handleStateChange = (value: string) => {
    onStateChange(value);
    onDistrictChange('');
  };

  return (
    <View style={styles.container}>
      {/* State Picker */}
      <TouchableOpacity
        style={styles.pickerField}
        onPress={() => setStateModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.pickerFieldInner}>
          <Text
            style={[
              styles.pickerLabel,
              selectedStateLabel ? styles.pickerLabelSmall : null,
            ]}
          >
            State / Union Territory
          </Text>
          {selectedStateLabel ? (
            <Text style={styles.pickerValue}>{selectedStateLabel}</Text>
          ) : null}
        </View>
        <IconButton icon="chevron-down" size={20} iconColor={COLORS.textSecondary} />
      </TouchableOpacity>

      <SearchableModal
        visible={stateModalVisible}
        onClose={() => setStateModalVisible(false)}
        title="Select State / UT"
        options={INDIAN_STATES}
        selectedValue={selectedState}
        onSelect={handleStateChange}
      />

      {/* District Picker */}
      {selectedState ? (
        hasPreDefinedDistricts ? (
          <>
            <TouchableOpacity
              style={[styles.pickerField, styles.districtField]}
              onPress={() => setDistrictModalVisible(true)}
              activeOpacity={0.7}
            >
              <View style={styles.pickerFieldInner}>
                <Text
                  style={[
                    styles.pickerLabel,
                    selectedDistrictLabel ? styles.pickerLabelSmall : null,
                  ]}
                >
                  District
                </Text>
                {selectedDistrictLabel ? (
                  <Text style={styles.pickerValue}>{selectedDistrictLabel}</Text>
                ) : null}
              </View>
              <IconButton
                icon="chevron-down"
                size={20}
                iconColor={COLORS.textSecondary}
              />
            </TouchableOpacity>

            <SearchableModal
              visible={districtModalVisible}
              onClose={() => setDistrictModalVisible(false)}
              title="Select District"
              options={DISTRICTS[selectedState] || []}
              selectedValue={selectedDistrict}
              onSelect={onDistrictChange}
            />
          </>
        ) : (
          <View style={styles.districtField}>
            <Input
              label="District"
              value={selectedDistrict}
              onChangeText={onDistrictChange}
              placeholder="Enter your district"
            />
          </View>
        )
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  pickerField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    minHeight: 56,
    paddingLeft: 16,
    paddingRight: 4,
  },
  districtField: {
    marginTop: 12,
  },
  pickerFieldInner: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  pickerLabel: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  pickerLabelSmall: {
    fontSize: 12,
    marginBottom: 2,
  },
  pickerValue: {
    fontSize: 15,
    color: COLORS.text,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 20,
    paddingRight: 4,
    paddingTop: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.text,
  },
  optionsList: {
    paddingHorizontal: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  optionItemSelected: {
    backgroundColor: `${COLORS.primary}0D`,
  },
  optionText: {
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  checkIcon: {
    margin: 0,
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
});

export default StateDistrictPicker;
