const {AppState, Client} = require('./model.js');

const updateAppState =  async ({openedTime, closedTime, active, clientName}) => {

  const state = await AppState.findOne({name:clientName})

    if (!state) {
      // No existing state found, create a new one
      console.log("No state exist")
      const newState = new AppState({
        name:clientName,
        active: active,
        openedAt: openedTime, 
        closedAt: closedTime,
      });
     await newState.save();
    } else {
      // Update the existing state
      console.log("updating state")
      state.active = active
      state.openedAt = openedTime;
      state.closedAt = closedTime;
       await state.save();
    }
}
const createNewClient = async (user)=>{
  console.log("Saving new client")
  const newClient = new Client({
    clientName: user.name
  })
  await newClient.save()
}


module.exports={
  updateAppState,
  createNewClient
}