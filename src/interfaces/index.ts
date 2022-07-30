
export interface IShift {
  id: string
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  week?: IWeek
  weekId?: string
  createdAt: Date,
  updatedAt: Date,

}
export interface IWeek {
  id: string,
  startDate: string,
  endDate: string,
  isPublished: boolean
  createdAt: Date,
  updatedAt: Date,
}