module.exports = (data) => {
  const message = [
    'It seems that today there will a fucking beautiful Aurora (not our sweet baby)\n',
    data.date,
    '---------------------',
  ];

  data.times.forEach((time) => {
    message.push(`${time.time}: ${time.stringValue}`);
  });

  return message.join('\n');
};
