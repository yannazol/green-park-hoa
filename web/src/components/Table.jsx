import { useState } from 'react';
import { useTheme } from '../context/useTheme';
import getTableStyles from '../styles/TableStyles';

export default function Table({
  columns,
  data,
  rowKey = '_id',
  onRowClick,
  emptyMessage = 'No records found.',
  style,
}) {
  const { colors } = useTheme();
  const s = getTableStyles(colors);
  const [hoveredKey, setHoveredKey] = useState(null);

  return (
    <div style={{ ...s.wrapper, ...style }}>
      <table style={s.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ ...s.th, textAlign: col.align || 'left', width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={s.empty}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => {
              const key = row[rowKey] ?? index;
              const clickable = typeof onRowClick === 'function';
              return (
                <tr
                  key={key}
                  onClick={clickable ? () => onRowClick(row) : undefined}
                  onMouseEnter={clickable ? () => setHoveredKey(key) : undefined}
                  onMouseLeave={clickable ? () => setHoveredKey(null) : undefined}
                  style={{
                    ...s.row,
                    ...(clickable ? s.rowClickable : {}),
                    ...(clickable && hoveredKey === key ? s.rowHover : {}),
                  }}
                >
                  {columns.map((col) => (
                    <td key={col.key} style={{ ...s.td, textAlign: col.align || 'left' }}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}