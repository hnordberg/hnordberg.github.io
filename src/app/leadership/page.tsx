import Contents from '../components/Contents'

const LeadershipPage = () => {
  const articles = [
    { id: 'metrics-okrs', title: 'Metrics, OKRs, and reviewing progress' },
    { id: 'lean-vs-scrum', title: 'Lean vs Scrum' },
    { id: 'retrospectives', title: 'Retrospectives' },
    { id: 'focus-of-the-week', title: 'Focus of the Week' },
    { id: 'lean-coffee', title: 'Lean Coffee' },
    { id: 'pairing', title: 'Pairing and Mob Programming' }
  ]

  return (
    <main className="page-with-contents">
      <Contents articles={articles} />
      <section className="card-grid">

        <div className="card" id="metrics-okrs">
          <div className="card-title">Metrics, OKRs, and reviewing progress</div>
          <div className="card-text">Much has been written about metrics, so I will focus on the core of the idea -- 
            creating a loop of deciding what metrics to use, recording them, and reviewing them regularly. If you are looking
            to start using metrics (or OKRs etc.), those three aspects should be at the core of your process.
          </div>
          <div className="card-subtitle pt-4">Motivation</div>
          <div className="card-text">Perhaps it's self-evident that you need to measure in order to course-correct. But it was surprising to me
            how effective metrics are for effecting change. Humans are competitive and seeing those numbers go up is 
            more motivating than having a manager telling you what to do.
          </div>
          <div className="card-subtitle pt-4">Deciding what metrics to use</div>
          <div className="card-text">Let your team decide what metrics to use, and let them change them as needed. Even if you are using OKRs, it's 
            easy to convince your team to change direction based on the metrics they chose. Then add the trickle-down metrics 
            from leadership or company goals. 
          </div>
          <div className="card-subtitle pt-4">Automate metrics gathering</div>
          <div className="card-text">Try to automate gathering and recording of metrics. Metrics are valuable and having someone spend 15 minutes a
            week to assemble them is probably worthwhile, but automating it saves time in the long run.
          </div>
          <div className="card-subtitle pt-4">Review often</div>
          <div className="card-text">Have your team review their metrics weekly. Celebrate victories and make course corrections when
            things trend downwards.
          </div>
        </div>

        <div className="card" id="lean-vs-scrum">
          <div className="card-title">Lean vs Scrum</div>
          <div className="card-text">Scrum is better than waterfall, and Lean is better than Scrum. Lean means small tasks instead of two-week
            sprints. Use a Kanban board.
          </div>
          <div className="card-subtitle pt-4">The huddle</div>
          <div className="card-text">The team has a huddle in the morning, but the format is a bit different for Lean than Scrum. Instead
            of asking what people did and what they plan to do, you go over the cards and ask about blockers, and 
            if someone needs help.
          </div>
          <div className="card-subtitle pt-4">Choosing what to work on</div>
          <div className="card-text">The main difference between Lean and Scrum is how you choose what to work on. Lean is metrics-driven
            and the focus is on tasks that can be completed in one to two days. Scrum usually has tasks
            spanning multiple days and releases every two weeks. Completing a task generally means getting it into production.
            This means you must have both a release pipeline and test automation that are strong enough to be 
            relied on for such frequent releases.
          </div>
          <div className="card-subtitle pt-4">Should you switch from Scrum to Lean?</div>
          <div className="card-text">In the end both methods work. I have observed happier teams when they are using Lean, and I
            would say it is worth exploring. It may seem daunting at first, but teams generally adapt quickly to it. 
            If you are curious, seek out an Agile conference to attend. That's how I learned about Lean (Agile-CA).
            A conference is a good place to learn about new ideas and discuss what's working and what's not.
            Bring someone from your team and you'll likely have a champion when it comes to implementing it.
          </div>
        </div>

        <div className="card" id="retrospectives">
          <div className="card-title">Retrospectives</div>
          <div className="card-text">A retro is a meeting where the team reflects on what went well and what could be improved.
            It can be a great tool, but only if used correctly.
          </div>
          <div className="card-subtitle pt-4">Do's and Don'ts</div>
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
            <li>If you have a large group, you can run your retros as a <a href="#lean-coffee">Lean Coffee</a> meeting.</li>
          </ul>
        </div>

        <div className="card" id="focus-of-the-week">
          <div className="card-title">Focus of the Week</div>
          <div className="card-text">This is something my team adapted from <a href="https://www.amazon.com/dp/1955469016">Radical Focus</a> by 
            Christina Wodtke. The book is about 
            OKRs and they discuss "Monday Commitments and Friday Wins" and we adapted it as Focus of the Week (FotW). The main
            idea is to pick something that is important to the team / organization, and designate it as the focus. Each time
            someone finishes a task, they ask what they can do to further the focus of the week. It's a way of ensuring
            that important things get done first. Team members who finish tasks ask other team members -- that are working on FotW -- 
            what they can do to help. It's simple and effective.
          </div>
          <div className="card-subtitle pt-4">Focus planning and review</div>
          <div className="card-text">Each Friday the team plans the focus for the following week.
            On Monday morning, the team reviews the focus for the week and adjusts it as needed. If you have multiple teams
            working on related efforts, you can have each team briefly present their focus. The team commits to
            finishing the focus by the end of the week. In a healthy organization the team will choose a focus that
            is challenging and without sandbagging (making it too easy). Use the retro to discuss how you can get better at
            picking the focus. The book suggests to have a separate meeting to celebrate the week's achievements.
            What we did instead is to use part of the Friday huddle to celebrate what was done and consider what was missed.
          </div>
        </div>

        <div className="card" id="lean-coffee">
          <div className="card-title">Lean Coffee -- Large meetings</div>
          <div className="card-text">Lean Coffee is a way of gathering input from a large group of people. 
            It's useful when you likely will not have time to cover every topic. It's driven by the participants, rather than the leader.
            If you have a large group, you can run your retros as a Lean Coffee meeting. I first learned about it from
            the fine folks at <a href="https://modernagile.org/">Modern Agile</a>.
          </div>
          <div className="card-subtitle pt-4">
            Voting system
          </div>
          <div className="card-text">
            It uses a voting system to decide what gets covered and in what order.
            In the original form, we would put a sticky note on the wall for each topic. Then we would vote on the topics.
            You get 3 votes (more if you have more participants). Put a dot on the sticky you would like to cover.
            In a remote setting, you can create a simple Kanban board and vote by putting your name on the card. 
            When people are done writing and voting, you go over the cards with the most votes. 
          </div>
        </div>

        <div className="card" id="pairing">
          <div className="card-title">Pairing and Mob Programming</div>
          <div className="card-text">Basic pairing involves two roles: the driver (at the keyboard)
             and the navigator (giving directions).
            A core idea is that all ideas flow from the navigator to the driver, and that the driver 
            only enters those ideas. You do, of course, swap roles so both can navigate.
            Mob programming is a variant of pairing but with more roles. In addition to the driver and navigator, 
            there are also a few other roles: Facilitator 
            (ensures courteousness and flow), Researcher, and others. 
            I went to visit Hunter Industries in San Diego to learn about their approach to pairing 
            and mob programming. I observed multiple groups there. Everyone at the company seemed to like it.
          </div>
          <div className="card-subtitle pt-4">Benefits</div>
          <div className="card-text">
            The main benefit is having more eyes on the code. It raises the quality of the code and more 
            people understand the code.
          </div>
          <div className="card-subtitle pt-4">Should your team do it?</div>
          <div className="card-text">
            Personally, I enjoy pairing and think the benefits outweigh the cost. But not all
            developers are extroverts and enjoy the process. If you want to introduce it, 
            you should stick with it for a meaningful length of time, at least for a couple of months.
            It takes a while to get into the rhythm. It takes a while to learn to stick to the roles.
          </div>
        </div>

        <div className="card hidden">
          <div className="card-title">.</div>
          <div className="card-text">.
          </div>
          <div className="card-subtitle pt-4">.</div>
          <div className="card-text">.
          </div>
        </div>

      </section>
    </main>
  )
}

export default LeadershipPage;
