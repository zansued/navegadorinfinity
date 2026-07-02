function APIHandler() {
  this.callLogin = async function(username, password, publickey, callback) {
    if (username && password && publickey) {
      try {
        const { data, error } = await supabaseClient
          .from('users')
          .select('*')
          .eq('username', username)
          .single();
        if (error || !data) {
          callback(error ? error.message : "User not found", null);
        } else if (!data.password) {
          // Se o usuário existe mas a senha está nula/vazia, associamos a senha atual
          await supabaseClient.from('users').update({ password, publickey }).eq('username', username);
          callback(null, { token: "fake-token", username: data.username });
        } else if (data.password !== password) {
          callback("Invalid password", null);
        } else {
          await supabaseClient.from('users').update({ publickey }).eq('username', username);
          callback(null, { token: "fake-token", username: data.username });
        }
      } catch (err) {
        callback(err.message, null);
      }
    }
  };

  this.callRegister = async function(spid, accountpassword, pubKey, email, referredBy, callback) {
    try {
      const { data, error } = await supabaseClient
        .from('users')
        .upsert([{
          username: spid,
          password: accountpassword,
          email: email,
          publickey: pubKey,
          referred_by: referredBy
        }]);
      if (error) {
        callback(error.message, null);
      } else {
        callback(null, { success: true });
      }
    } catch (err) {
      callback(err.message, null);
    }
  };

  this.callRefresh = function(token, callback) {
    callback(null, { token: token });
  };

  this.getFriends = async function(username, callback) {
    try {
      const { data, error } = await supabaseClient
        .from('friends')
        .select('friend_spid')
        .eq('user_spid', username);
      if (error) {
        callback(error.message, null);
      } else {
        const result = data.map(d => ({ username: d.friend_spid, currentStatus: "offline" }));
        callback(null, { result: result });
      }
    } catch (err) {
      callback(err.message, null);
    }
  };

  this.getMutualFriends = async function(username, callback) {
    try {
      const { data, error } = await supabaseClient
        .from('friends')
        .select('friend_spid')
        .eq('user_spid', username);
      if (error) {
        callback(error.message, null);
      } else {
        const result = data.map(d => ({ username: d.friend_spid, currentStatus: "online" }));
        callback(null, { result: result });
      }
    } catch (err) {
      callback(err.message, null);
    }
  };

  this.addFriend = async function(user_spid, friend_spid, callback) {
    try {
      // Check if friend exists
      const { data: userData, error: userError } = await supabaseClient
        .from('users')
        .select('username')
        .eq('username', friend_spid)
        .single();
      
      if (userError || !userData) {
        callback('Friend does not exist in our records.', null);
        return;
      }

      const { error } = await supabaseClient
        .from('friends')
        .insert([{ user_spid, friend_spid }]);
      if (error && error.code !== '23505') { 
        callback('Unable to add friend.', null);
      } else {
        callback(null, { success: true });
      }
    } catch (err) {
      callback('Unable to add friend.', null);
    }
  };

  this.removeFriend = async function(user_spid, friend_spid, callback) {
    try {
      const { error } = await supabaseClient
        .from('friends')
        .delete()
        .eq('user_spid', user_spid)
        .eq('friend_spid', friend_spid);
      if (error) {
        callback(error.message, null);
      } else {
        callback(null, { success: true });
      }
    } catch (err) {
      callback(err.message, null);
    }
  };

  
  this.getPendingSessions = async function(username, callback) {
    try {
      const { data, error } = await supabaseClient
        .from('sessions')
        .select('*')
        .eq('receiver', username);
      if (error) {
        callback(error.message, null);
      } else {
        // Apenas retorna os dados da sessão sem deletá-los da tabela,
        // permitindo que múltiplos clientes conectem ao mesmo perfil simultaneamente.
        callback(null, data);
      }
    } catch (err) {
      callback(err.message, null);
    }
  };

  this.savePreferences = function(username, settings, callback) { callback(null, { success: true }); };
  this.getLeaderboard = function(callback) { callback(null, []); };
  this.saveSubscription = function(email, subData, callback) { callback(null, { success: true }); };
  this.callRecoverRequest = function(email, callback) { callback(null, { success: true }); };
  this.callRecoverVerify = function(email, code, callback) { callback(null, { success: true }); };
  this.callRecoverComplete = function(token, pass, pubkey, callback) { callback(null, { success: true }); };
}