/**
 * Session card component for displaying sessions
 */
import React from "react";
import { Session } from "../../model/types";
import { formatSessionTime, getSessionTypeColor } from "../../model/session";
import { Card, Row, SpaceBetween, BodyText, SecondaryText } from "./StyledComponents";
import { format } from "date-fns";
import { View, TouchableOpacity } from "react-native";

/**
 * Props for SessionCard component
 */
export type SessionCardProps = {
  session: Session;
  onPress?: () => void;
  onComplete?: () => void;
};

/**
 * Session card component
 */
export const SessionCard: React.FC<SessionCardProps> = ({ session, onPress, onComplete }) => {
  const backgroundColor = getSessionTypeColor(session.sessionType);
  const timeRange = formatSessionTime(session);

  return (
    <TouchableOpacity
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${session.sessionType.name} session from ${timeRange}`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Card style={{ marginBottom: 12 }}>
      <Row>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor,
            marginRight: 12,
            alignItems: "center",
            justifyContent: "center",
          }}
          accessible={false}
        >
          {/* Icon based on session type */}
          {session.sessionType.name.toLowerCase().includes("meditation") && (
            <BodyText style={{ fontSize: 20 }}>🍃</BodyText>
          )}
          {session.sessionType.name.toLowerCase().includes("meeting") && (
            <BodyText style={{ fontSize: 20 }}>☕</BodyText>
          )}
          {(session.sessionType.name.toLowerCase().includes("deep work") || session.sessionType.name.toLowerCase().includes("deepwork")) && (
            <BodyText style={{ fontSize: 20 }}>🧠</BodyText>
          )}
          {session.sessionType.name.toLowerCase().includes("workout") && (
            <BodyText style={{ fontSize: 20 }}>💪</BodyText>
          )}
          {session.sessionType.name.toLowerCase().includes("language") && (
            <BodyText style={{ fontSize: 20 }}>🌐</BodyText>
          )}
        </View>
        <View style={{ flex: 1 }} accessible={false}>
          <BodyText style={{ fontWeight: "600", marginBottom: 4, fontSize: 16 }}>
            {session.sessionType.name}
          </BodyText>
          <Row>
            <SecondaryText style={{ fontSize: 14 }}>🕐 {timeRange}</SecondaryText>
          </Row>
        </View>
        {session.completed ? (
          <View
            accessible={true}
            accessibilityLabel={`${session.sessionType.name} session completed`}
            accessibilityRole="image"
            style={{
              minWidth: 44,
              minHeight: 44,
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "#1E3A8A",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BodyText style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "600" }}>✓</BodyText>
          </View>
        ) : (
          <TouchableOpacity
            accessible={true}
            accessibilityLabel={`Mark ${session.sessionType.name} session as completed`}
            accessibilityHint="Double tap to mark this session as completed"
            accessibilityRole="button"
            onPress={onComplete}
            style={{
              minWidth: 44,
              minHeight: 44,
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "transparent",
              borderWidth: 2,
              borderColor: "#E2E8F0",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Empty circle for incomplete */}
          </TouchableOpacity>
        )}
      </Row>
      </Card>
    </TouchableOpacity>
  );
};

