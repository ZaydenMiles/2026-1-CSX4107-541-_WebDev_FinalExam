//src/components/EmptyState.jsx

import { Card, Typography } from "@mui/material";

export default function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <Card sx={{ px: 3, py: 8, textAlign: "center" }}>
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
        <Icon />
      </div>
      <Typography variant="h6" component="p">
        {title}
      </Typography>
      {text && (
        <Typography color="text.secondary" sx={{ mt: 1, mb: action ? 3 : 0 }}>
          {text}
        </Typography>
      )}
      {action}
    </Card>
  );
}
