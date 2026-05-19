import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { TOKENS } from '../src/theme/tokens'
import { SyncBadge } from './SyncBadge'
import { FieldTags } from './FieldTags'
import { IconTrash, IconGrid } from '../src/icons'

interface Props {
  title: string
  responses: number
  fields: string[]
  syncStatus: 'synced' | 'pending' | 'new'
  pendingCount: number
  onPress: () => void
  onSync?: () => void
  onDelete: () => void
}

export function FormCard({
  title,
  responses,
  fields,
  syncStatus,
  pendingCount,
  onPress,
  onSync,
  onDelete,
}: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.cardActions}>
          <SyncBadge
            status={syncStatus}
            pendingCount={pendingCount}
            onPress={syncStatus === 'pending' && onSync ? (event) => {
              event.stopPropagation()
              onSync()
            } : undefined}
          />
          <TouchableOpacity onPress={(event) => {
            event.stopPropagation()
            onDelete()
          }} style={styles.deleteBtn}>
            <IconTrash size={14} color={TOKENS.colors.gray400} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.cardMeta}>
        <View style={styles.metaItem}>
          <IconGrid size={14} color={TOKENS.colors.gray400} />
          <Text style={styles.metaText}>{responses} responses</Text>
        </View>
      </View>
      <FieldTags types={fields} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: TOKENS.colors.white,
    borderWidth: TOKENS.border.width,
    borderColor: TOKENS.colors.gray200,
    borderRadius: TOKENS.radius.container,
    padding: TOKENS.spacing.cardPadding,
    marginBottom: TOKENS.spacing.cardGap,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: TOKENS.fontSize.cardTitle,
    fontWeight: TOKENS.type.weightSemibold,
    color: TOKENS.colors.black,
    letterSpacing: -0.01,
    lineHeight: 22,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0,
    marginLeft: 6,
  },
  deleteBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: TOKENS.fontSize.small,
    color: TOKENS.colors.gray500,
  },
})
