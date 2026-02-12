import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Collapse,
  CardActionArea,
} from "@mui/material";
import { ExpandMore as ExpandIcon } from "@mui/icons-material";
import type { SourceChunk } from "../../types";

interface SourceCardProps {
  source: SourceChunk;
  index: number;
}

export default function SourceCard({ source, index }: SourceCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card variant="outlined" sx={{ mb: 0.5 }}>
      <CardActionArea onClick={() => setExpanded(!expanded)}>
        <CardContent sx={{ py: 1, "&:last-child": { pb: 1 } }}>
          <Typography variant="caption" display="flex" alignItems="center" gap={0.5}>
            <ExpandIcon
              fontSize="small"
              sx={{
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            />
            [Source {index}] {source.document_name}
          </Typography>
        </CardContent>
      </CardActionArea>
      <Collapse in={expanded}>
        <CardContent sx={{ pt: 0 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
            {source.content}
          </Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
}
