import { SafeHtml } from "@angular/platform-browser"

export interface HTTableColumn {
  name: string
  dataKey: string
  position?: 'right' | 'left'
  isSortable?: boolean
  render?: (data: any) => SafeHtml
}