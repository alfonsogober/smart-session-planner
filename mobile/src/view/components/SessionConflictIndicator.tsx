/**
 * Component to display session conflicts
 */
import React from "react";
import { View } from "react-native";
import { Card, BodyText, SecondaryText } from "./StyledComponents";
import { Session } from "../../model/types";
import { formatSessionTime } from "../../model/session";

/**
 * Props for SessionConflictIndicator component
 */
export type SessionConflictIndicatorProps = {
  conflicts: Session[];
};

/**
 * Component to show conflicting sessions
 */
export const SessionConflictIndicator: React.FC<SessionConflictIndicatorProps> = ({ conflicts }) => {
  if (conflicts.length === 0) return null;

  return (
    <Card style={{ backgroundColor: "#FEE2E2", marginTop: 8, padding: 12 }}>
      <BodyText style={{ fontSize: 14, fontWeight: "600", color: "#DC2626", marginBottom: 4 }}>
        ⚠️ Conflicts with {conflicts.length} session{conflicts.length > 1 ? "s" : ""}:
      </BodyText>
      {conflicts.map((conflict) => (
        <SecondaryText key={conflict.id} style={{ fontSize: 12, color: "#991B1B", marginLeft: 8 }}>
          • {conflict.sessionType.name} at {formatSessionTime(conflict)}
        </SecondaryText>
      ))}
    </Card>
  );
};


