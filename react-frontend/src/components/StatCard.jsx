//src/components/StatCard.jsx

import { Card, CardContent, Typography } from "@mui/material";

export default function StatCard({ icon: Icon, label, value, hint, color = "#4F46E5" }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${color}14`, color }}
        >
          <Icon />
        </div>
        <div className="min-w-0">
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h5" component="p" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            {value}
          </Typography>
          {hint && (
            <Typography variant="caption" color="text.secondary">
              {hint}
            </Typography>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
