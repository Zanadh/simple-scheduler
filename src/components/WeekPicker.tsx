import clsx from "clsx";
import format from "date-fns/format";
import isValid from "date-fns/isValid";
import isSameDay from "date-fns/isSameDay";
import endOfWeek from "date-fns/endOfWeek";
import React from "react";
import startOfWeek from "date-fns/startOfWeek";
import isWithinInterval from "date-fns/isWithinInterval";
import { DatePicker, DatePickerProps } from "@material-ui/pickers";
import { createStyles } from "@material-ui/styles";
import { Box, colors, IconButton, styled, withStyles, WithStyles } from "@material-ui/core";
import { ChevronLeft, ChevronRight } from "@material-ui/icons";
import { addDays, subDays } from "date-fns";

const makeJSDateObject = (date: Date | null): Date => {
  if (date instanceof Date) {
    return new Date(date.getTime());
  }

  return new Date()
}
//TODO: fix code style - separate interfaces/types
const StyledDatePicker = styled(DatePicker)({
  '& .MuiInput-input': {
    textAlign: 'center',
    borderWidth: 0
  },
});

type Direction = 'left' | 'right'

const ArrowButton = (props: { direction?: Direction, onClick?: (direction: Direction) => void }) => {
  const arrowType = props?.direction || 'left'
  const defaultStyle = { border: '1px solid gray', cursor: 'pointer' }

  const iconProps = { style: defaultStyle, onClick: () => props.onClick && props.onClick(arrowType) }

  switch (arrowType) {
    case 'left':
      return <ChevronLeft {...iconProps} />
    case 'right':
      return <ChevronRight {...iconProps} />
    default:

      return <ChevronLeft {...iconProps} />
  }
}
interface WeekPickerProps {
  selectedStartDate?: Date | null,
  onWeekChange?: (startDateOfWeek: Date) => void
  InputProps?: DatePickerProps['InputProps']
}
const WeekPicker: React.FC<WeekPickerProps & WithStyles> = ({ selectedStartDate, onWeekChange, classes, InputProps }) => {
  const handleWeekChange = (date: Date | null) => {
    onWeekChange && onWeekChange(startOfWeek(makeJSDateObject(date), { weekStartsOn: 1 }));
  };

  const formatWeekSelectLabel = (date: Date | null, invalidLabel: string) => {
    let dateClone = makeJSDateObject(date);
    return dateClone && isValid(dateClone)
      ? `${format(startOfWeek(dateClone, { weekStartsOn: 1 }), "MMM dd")} - ${format(endOfWeek(dateClone, { weekStartsOn: 1 }), "MMM dd")}`
      : invalidLabel;
  };

  const renderWrappedWeekDay = (date: Date | null, selectedDate: Date | null, dayInCurrentMonth: boolean) => {
    let dateClone = makeJSDateObject(date);
    let selectedDateClone = makeJSDateObject(selectedDate);

    const start = startOfWeek(selectedDateClone, { weekStartsOn: 1 });
    const end = endOfWeek(selectedDateClone, { weekStartsOn: 1 });

    const dayIsBetween = isWithinInterval(dateClone, { start, end });
    const isFirstDay = isSameDay(dateClone, start);
    const isLastDay = isSameDay(dateClone, end);

    const wrapperClassName = clsx({
      [classes.highlight]: dayIsBetween,
      [classes.firstHighlight]: isFirstDay,
      [classes.endHighlight]: isLastDay,
    });

    const dayClassName = clsx(classes.day, {
      [classes.nonCurrentMonthDay]: !dayInCurrentMonth,
      [classes.highlightNonCurrentMonthDay]: !dayInCurrentMonth && dayIsBetween,
    });

    return (
      <div className={wrapperClassName}>
        <IconButton className={dayClassName}>
          <span> {format(dateClone, "d")} </span>
        </IconButton>
      </div>
    );
  };

  const handleClickArrow = (direction: Direction) => {
    if (selectedStartDate) {
      handleWeekChange(direction === 'right' ? addDays(selectedStartDate, 7) : subDays(selectedStartDate, 7))
    }
  }

  return (
    <Box display='flex' alignItems="center">
      <ArrowButton onClick={handleClickArrow} />
      <StyledDatePicker
        value={selectedStartDate}
        onChange={handleWeekChange}
        renderDay={renderWrappedWeekDay}
        labelFunc={formatWeekSelectLabel}
        color="secondary"
        InputProps={InputProps}
      />
      <ArrowButton direction="right" onClick={handleClickArrow} />
    </Box>
  )
}

const styles = createStyles((theme: any) => ({
  dayWrapper: {
    position: "relative",
  },
  day: {
    width: 36,
    height: 36,
    fontSize: theme.typography.caption.fontSize,
    margin: "0 2px",
    color: "inherit",
  },
  customDayHighlight: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "2px",
    right: "2px",
    border: `1px solid ${theme.palette.secondary.main}`,
    borderRadius: "50%",
  },
  nonCurrentMonthDay: {
    color: theme.palette.text.disabled,
  },
  highlightNonCurrentMonthDay: {
    color: "#676767",
  },
  highlight: {
    background: colors.teal['200'],
    color: theme.palette.common.white,
  },
  firstHighlight: {
    extend: "highlight",
    borderTopLeftRadius: "50%",
    borderBottomLeftRadius: "50%",
  },
  endHighlight: {
    extend: "highlight",
    borderTopRightRadius: "50%",
    borderBottomRightRadius: "50%",
  },
}));

export default withStyles(styles)(WeekPicker);
