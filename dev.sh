#!/bin/bash
tmux new -d -s dl_prepare
tmux send-keys -t dl_prepare 'nvm use 6'
tmux send-keys -t dl_prepare 'Enter'
tmux send-keys -t dl_prepare 'npm run prepare:watch'
tmux send-keys -t dl_prepare 'Enter'

tmux new -d -s dl_devmon
tmux send-keys -t dl_devmon 'nvm use 6'
tmux send-keys -t dl_devmon 'Enter'
tmux send-keys -t dl_devmon 'npm run devmon'
