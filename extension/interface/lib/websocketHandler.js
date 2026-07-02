function WebSocketHandler() {
  let i = this;
  Event.call(this);

  let subscription = null;

  this.isConnected = function() {
    return !!subscription;
  };

  this.createConnection = function(token, callback) {
    if (subscription) {
      supabaseClient.removeChannel(subscription);
    }
    
    // Subscribe to INSERT events on the sessions table where receiver is currentSPID
    subscription = supabaseClient.channel('public:sessions')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sessions', filter: 'receiver=eq.' + currentSPID }, payload => {
        const row = payload.new;
        console.log("Session received from: " + row.sender);
        i.emit("session-received", row.sender, row.session_data, row.publickey);
      })
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log("Supabase Realtime Subscribed!");
          if (typeof callback === 'function') {
            callback(null);
            callback = null; // Prevent multiple callbacks on future reconnections
          }
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          if (typeof logDebug === 'function') {
            logDebug("Supabase Realtime connection issue: " + (err ? (err.message || String(err)) : status));
          } else {
            console.warn("Supabase Realtime connection issue:", err || status);
          }
          // Only callback with error if it hasn't succeeded before
          if (typeof callback === 'function') {
             callback("Connection error");
             callback = null; // Prevent multiple callbacks
          } else {
             i.emit("error", err);
          }
        }
      });
  };

  this.reconnect = function(e) {
    console.log("Supabase handles reconnections automatically.");
  };

  this.closeConnection = function() {
    if (subscription) {
      supabaseClient.removeChannel(subscription);
      subscription = null;
    }
  };

  this.getPresenceForSPID = async function(name) {
    if (name && name.length > 0) {
      // Simulate presence as true for now (since we don't have a presence table set up)
      i.emit("presence-received", true);
    }
  };

  this.getUserDetails = async function(name) {
    if (name && name.length > 0) {
      try {
        const { data, error } = await supabaseClient
          .from('users')
          .select('publickey')
          .eq('username', name)
          .single();
        if (error || !data) {
          i.emitonce("userdetails-received", null, error ? error.message : "User not found");
        } else {
          i.emitonce("userdetails-received", data.publickey, null);
        }
      } catch (err) {
        i.emitonce("userdetails-received", null, err.message);
      }
    }
  };

  this.sendSession = async function(name, session_data, publickey, domain, duration) {
    console.log("Sending To:", name);
    if (name && name.length > 0) {
      try {
        // Remove sessões anteriores idênticas de receptor/domínio para evitar acumular lixo no Supabase
        await supabaseClient
          .from('sessions')
          .delete()
          .eq('receiver', name)
          .eq('domain', domain);
      } catch (delErr) {
        console.error("Error cleaning old sessions:", delErr);
      }

      const { error } = await supabaseClient
        .from('sessions')
        .insert([{
          sender: currentSPID,
          receiver: name,
          session_data: session_data,
          publickey: publickey,
          domain: domain,
          duration: duration
        }]);
      if (error) {
        console.error("Error sending session to Supabase:", error);
      }
    }
  };

  this.ping = function() {
    // No-op for Supabase Realtime
  };
}