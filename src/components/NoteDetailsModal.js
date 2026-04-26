import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useTranslation } from 'react-i18next';

export default function NoteDetailsModal({ visible, onClose, nota }) {
  const { t } = useTranslation();

  if (!nota) return null; console.log('NOTA:', nota.titulo, '| lat:', nota.latitude, '| lng:', nota.longitude);


  const temCoordenadas =
    typeof nota.latitude === 'number' && typeof nota.longitude === 'number';

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.titulo}>{nota.titulo}</Text>
          <Text style={styles.conteudo}>{nota.conteudo}</Text>

          {temCoordenadas ? (
            <>
              <Text style={styles.label}>{t('localizacao') || 'Localização'}</Text>
              <MapView
                style={styles.mapa}
                initialRegion={{
                  latitude: nota.latitude,
                  longitude: nota.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: nota.latitude,
                    longitude: nota.longitude,
                  }}
                  title={nota.titulo}
                />
              </MapView>
              <Text style={styles.coords}>
                Lat: {nota.latitude.toFixed(5)} | Lng: {nota.longitude.toFixed(5)}
              </Text>
            </>
          ) : (
            <Text style={styles.semLocal}>
              {t('semLocalizacao') || 'Esta nota não possui localização salva.'}
            </Text>
          )}

          <TouchableOpacity style={styles.botao} onPress={onClose}>
            <Text style={styles.botaoTexto}>{t('fechar') || 'Fechar'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modal: { backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  titulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  conteudo: { fontSize: 15, color: '#555', marginBottom: 15 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 6 },
  mapa: { width: width - 80, height: 220, borderRadius: 8 },
  coords: { fontSize: 12, color: '#888', textAlign: 'center', marginTop: 6 },
  semLocal: { fontStyle: 'italic', color: '#888', textAlign: 'center', marginVertical: 20 },
  botao: { backgroundColor: '#4A90D9', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  botaoTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
