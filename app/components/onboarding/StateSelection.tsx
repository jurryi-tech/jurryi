import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, RadioButton, TouchableRipple } from 'react-native-paper';
import { INDIAN_STATES, DISTRICTS, SelectOption } from '@/utils/constants';

interface StateSelectionProps {
  selectedState: string;
  selectedDistrict: string;
  onStateChange: (state: string) => void;
  onDistrictChange: (district: string) => void;
}

const StateSelection: React.FC<StateSelectionProps> = ({
  selectedState,
  selectedDistrict,
  onStateChange,
  onDistrictChange,
}) => {
  const [stateSearch, setStateSearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');

  const filteredStates = useMemo(() => {
    if (!stateSearch) return INDIAN_STATES;
    const lower = stateSearch.toLowerCase();
    return INDIAN_STATES.filter((s) => s.label.toLowerCase().includes(lower));
  }, [stateSearch]);

  const availableDistricts = useMemo(() => {
    if (!selectedState) return [];
    const districts = DISTRICTS[selectedState] || [];
    if (!districtSearch) return districts;
    const lower = districtSearch.toLowerCase();
    return districts.filter((d) => d.label.toLowerCase().includes(lower));
  }, [selectedState, districtSearch]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Where are you located?</Text>
      <Text style={styles.subheading}>
        This helps us provide jurisdiction-specific legal guidance
      </Text>

      <Text style={styles.label}>State / Union Territory</Text>
      <TextInput
        mode="outlined"
        placeholder="Search state..."
        value={stateSearch}
        onChangeText={setStateSearch}
        style={styles.searchInput}
        left={<TextInput.Icon icon="magnify" />}
        dense
        outlineColor="#e0e0e0"
        activeOutlineColor="#1a237e"
      />
      <ScrollView style={styles.listContainer} nestedScrollEnabled>
        {filteredStates.map((state) => (
          <TouchableRipple
            key={state.value}
            onPress={() => {
              onStateChange(state.value);
              onDistrictChange('');
              setDistrictSearch('');
            }}
            style={[
              styles.listItem,
              selectedState === state.value && styles.selectedItem,
            ]}
          >
            <View style={styles.radioRow}>
              <RadioButton
                value={state.value}
                status={selectedState === state.value ? 'checked' : 'unchecked'}
                onPress={() => {
                  onStateChange(state.value);
                  onDistrictChange('');
                }}
                color="#1a237e"
              />
              <Text style={styles.itemText}>{state.label}</Text>
            </View>
          </TouchableRipple>
        ))}
      </ScrollView>

      {selectedState && availableDistricts.length > 0 && (
        <>
          <Text style={[styles.label, { marginTop: 16 }]}>District</Text>
          <TextInput
            mode="outlined"
            placeholder="Search district..."
            value={districtSearch}
            onChangeText={setDistrictSearch}
            style={styles.searchInput}
            left={<TextInput.Icon icon="magnify" />}
            dense
            outlineColor="#e0e0e0"
            activeOutlineColor="#1a237e"
          />
          <ScrollView style={styles.listContainer} nestedScrollEnabled>
            {availableDistricts.map((district) => (
              <TouchableRipple
                key={district.value}
                onPress={() => onDistrictChange(district.value)}
                style={[
                  styles.listItem,
                  selectedDistrict === district.value && styles.selectedItem,
                ]}
              >
                <View style={styles.radioRow}>
                  <RadioButton
                    value={district.value}
                    status={selectedDistrict === district.value ? 'checked' : 'unchecked'}
                    onPress={() => onDistrictChange(district.value)}
                    color="#1a237e"
                  />
                  <Text style={styles.itemText}>{district.label}</Text>
                </View>
              </TouchableRipple>
            ))}
          </ScrollView>
        </>
      )}

      {selectedState && availableDistricts.length === 0 && (
        <>
          <Text style={[styles.label, { marginTop: 16 }]}>District</Text>
          <TextInput
            mode="outlined"
            placeholder="Enter your district"
            value={selectedDistrict}
            onChangeText={onDistrictChange}
            style={styles.searchInput}
            dense
            outlineColor="#e0e0e0"
            activeOutlineColor="#1a237e"
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  listContainer: {
    maxHeight: 180,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
  },
  listItem: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  selectedItem: {
    backgroundColor: '#e8eaf6',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 14,
    color: '#212121',
    flex: 1,
  },
});

export default StateSelection;
