// // Custom render cho từng optionF
// const CustomOption = (props: any) => {
//   const { data, innerRef, innerProps } = props;
//   return (
//     <div ref={innerRef} {...innerProps} className="p-2 hover:bg-gray-100 flex items-center gap-3">
//       <Avatar src={data.avatarUrl} sx={{ width: 36, height: 36 }} />
//       <div>
//         <Typography variant="body1" fontWeight="bold">
//           {data.label}
//         </Typography>
//         <Typography variant="body2" color="text.secondary">
//           {data.rank}
//         </Typography>
//       </div>
//     </div>
//   );
// };

// // Custom render cho value đang chọn
// const CustomSingleValue = (props: any) => {
//   const { data } = props;
//   return (
//     <components.SingleValue {...props}>
//       <div className="flex items-center gap-2">
//         <Avatar src={data.avatarUrl} sx={{ width: 24, height: 24 }} />
//         <span>{data.label}</span>
//       </div>
//     </components.SingleValue>
//   );
// };
