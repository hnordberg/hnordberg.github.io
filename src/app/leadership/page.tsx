import './style.css'

const LeadershipPage = () => {

  return (
    <main>
      <section id="leadership">

        <div className="leadership-card">
          <div className="leadership-card-title">Metrics, OKRs, and reviewing progress</div>
          <div className="leadership-card-text">Much has been written about metrics, so I will focus on the core of the idea -- 
            creating a loop of deciding what metrics to use, recording them, and reviewing them regularly. If you are looking
            to start using metrics (or OKRs etc.), those three aspects should be at the core of your process.
          </div>
          <div className="leadership-card-subtitle pt-4">Motivation</div>
          <div className="leadership-card-text">Perhaps it's self-evident that you need to measure in order to course correct. But it was surprising to me
            how effective metrics are for effecting change. Humans are competitive and seeing those numbers go up is 
            more motivating than having a manager telling you what to do.
          </div>
          <div className="leadership-card-subtitle pt-4">Deciding what metrics to use</div>
          <div className="leadership-card-text">Let your team decide what metrics to use, and let them change them as needed. Even if you are using OKRs, it's 
            easy to convice your team to change direction based on the metrics they chose. Then add the trickle down metrics 
            from leadership or company goals. 
          </div>
          <div className="leadership-card-subtitle pt-4">Automate metrics gathering</div>
          <div className="leadership-card-text">Try to automate gathering and recording of metrics. Metrics are valuable and having someone spend 15 minutes a
            week to assemble them is probably worthwhile, but automating it saves time in the long run.
          </div>
          <div className="leadership-card-subtitle pt-4">Review often</div>
          <div className="leadership-card-text">Have your team review their metrics weekly. Celebrate victories and make course corrections when
            things trend downwards.
          </div>
        </div>

        <div className="leadership-card">
          <div className="leadership-card-title">Lean vs Scrum</div>
          <div className="leadership-card-text">Scrum is better than waterfall, and Lean is better than Scrum. Lean means small tasks instead of two-week
            sprints. Use a Kanban board.
          </div>
          <div className="leadership-card-subtitle pt-4">The huddle</div>
          <div className="leadership-card-text">The team has a huddle in the morning, but the format is a bit different for Lean than Scrum. Instead
            of asking what people did and what they plan to do, you go over the cards and ask about blockers, and 
            if someone needs help.
          </div>
          <div className="leadership-card-subtitle pt-4">Choosing what to work on</div>
          <div className="leadership-card-text">The main difference between Lean and Scrum, is how you choose what to work on. Lean is metrics
            driven and the focus is on tasks that can be completed in one to two days. Scrum usually have tasks
            spanning multiple days and releases every two weeks. Completing a task generally means getting it into production.
            This means you must have both a release pipeline and test automation that're strong enough to be 
            relied on for such frequent releases.
          </div>
          <div className="leadership-card-subtitle pt-4">Should you switch from Scrum to Lean?</div>
          <div className="leadership-card-text">In the end both methods work. I have observed happier teams when they are using Lean, and I
            would say it is worth exploring. It may seem daunting at first, but teams generally adapt quickly to it. 
            If you are curious, seek out an Agile conference to attend. That's how I learned about Lean (Agile-CA).
            A conference is a good place to learn about new ideas and discuss what's working and what's not.
            Bring someone from your team and you'll likely have a champion when it comes to implementing it.
          </div>
        </div>

        <div className="leadership-card">
          <div className="leadership-card-title">Retrospectives</div>
          <div className="leadership-card-text">A retro is a meeting where the team reflects on what went well and what could be improved.
            It can be a great tool, but only if used correctly.
          </div>
          <div className="leadership-card-subtitle pt-4">Do's and Don'ts</div>
          <ul className="list">
            <li>Regular cadence (weekly or bi-weekly)</li>
            <li>Don't skip more than one retro in a row</li>
            <li>Take turns leading the retro. Make sure everyone gets to lead.</li>
            <li>Everyone should write at least one thing that went well, and one thing that could be improved. 
              Otherwise you run the risk of people who are unhappy not speaking up. Though this may need 
              to be tweaked for larger teams.
            </li>
            <li>Celebrate the small stuff. "I appreciate you for pairing with me on debugging the issue yesterday."</li>
            <li>As a leader, focus on guiding the team back to these rules, instead of "leading" the retro.</li>
            <li>These rules are guidelines, so use the retro to adjust them for your team.</li>
          </ul>
        </div>

        <div className="leadership-card">
          <div className="leadership-card-title">Focus of the Week</div>
          <div className="leadership-card-text">This is something my team adapted from <a href="https://www.amazon.com/dp/1955469016">Radical Focus</a> by 
            Christina Wodtke. The book is about 
            OKR's but they discuss "Monday Commitments and Friday Wins" and we adapted it as Focus of the Week (FotW). The main
            idea is to pick something that is important to the team / organization, and designate it as the focus. Each time
            someone finishes a task, they ask what they can do to futher the focus of the week. It's a way of ensuring
            that important things get done first. Team members who finish tasks ask other team members -- that are working on FotW -- 
            what they can do to help. It's simple and effective.
          </div>
          <div className="leadership-card-subtitle pt-4">Focus planning and review</div>
          <div className="leadership-card-text">Each Friday the team plans the focus for the following week.
            On Monday morning, the team reviews the focus for the week and adjusts it as needed. If you have mutliple teams
            working on related efforts, you can have each team briefly present their focus. The team commits to
            finishing the focus by the end of the week. In a healthy organization the team will choose a focus that
            is challenging and without sandbagging (making it too easy). Use the retro to discuss how you can get better at
            picking the focus. The book suggests to have a separate meeting to celebrate the week's achievements.
            What we did instead is to use part of the Friday huddle to celebrate what was done and consider what was missed.
          </div>
        </div>

        <div className="leadership-card hidden">
          <div className="leadership-card-title">.</div>
          <div className="leadership-card-text">.
          </div>
          <div className="leadership-card-subtitle pt-4">.</div>
        </div>
      </section>
    </main>
  )
}

export default LeadershipPage;
